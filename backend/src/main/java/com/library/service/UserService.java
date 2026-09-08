package com.library.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Borrow;
import com.library.model.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.FavoriteRepository;
import com.library.repository.FineRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public List<Map<String, Object>> getAllUsersWithStats() {
        List<User> users = userRepository.findAll();
        return users.stream().map(u -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", u.getId());
            map.put("name", u.getName());
            map.put("email", u.getEmail());
            map.put("phone", u.getPhone());
            map.put("role", u.getRole());
            map.put("active", u.isActive());
            map.put("createdAt", u.getCreatedAt());

            long activeBorrows = borrowRepository.countByUserIdAndStatus(u.getId(), Borrow.Status.BORROWED);
            long overdueBorrows = borrowRepository.countByUserIdAndStatus(u.getId(), Borrow.Status.OVERDUE);
            long totalBorrows = borrowRepository.countByUserId(u.getId());
            double unpaidFines = fineRepository.findByUserId(u.getId()).stream()
                    .filter(f -> f.getStatus() == com.library.model.Fine.Status.UNPAID)
                    .mapToDouble(com.library.model.Fine::getFineAmount)
                    .sum();

            map.put("activeBorrows", activeBorrows);
            map.put("overdueBorrows", overdueBorrows);
            map.put("totalBorrows", totalBorrows);
            map.put("unpaidFines", unpaidFines);
            return map;
        }).collect(Collectors.toList());
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    public Map<String, Object> getUserDetailsWithHistory(String userId) {
        User user = getUserById(userId);
        Map<String, Object> details = new HashMap<>();
        details.put("user", user);
        details.put("activeBorrows", borrowRepository.findByUserIdAndStatus(userId, Borrow.Status.BORROWED));
        details.put("overdueBorrows", borrowRepository.findByUserIdAndStatus(userId, Borrow.Status.OVERDUE));
        details.put("allBorrows", borrowRepository.findByUserIdOrderByRequestDateDesc(userId));
        details.put("fines", fineRepository.findByUserId(userId));
        details.put("reservations", reservationRepository.findByUserIdOrderByReservationDateDesc(userId));
        details.put("recentActivities", activityLogRepository.findByUserIdOrderByTimestampDesc(userId));
        return details;
    }

    public User toggleUserStatus(String id, String adminEmail, String adminId) {
        User user = getUserById(id);
        if (user.getRole() == User.Role.ROLE_ADMIN && user.getId().equals(adminId)) {
            throw new BadRequestException("Admins cannot deactivate their own account");
        }

        user.setActive(!user.isActive());
        user.setUpdatedAt(LocalDateTime.now());
        User saved = userRepository.save(user);

        String action = saved.isActive() ? "USER_ACTIVATED" : "USER_BLOCKED";
        activityLogService.log(adminId, adminEmail, action, (saved.isActive() ? "Activated" : "Blocked") + " user " + saved.getEmail());
        return saved;
    }

    public void deleteUser(String id, String adminEmail, String adminId) {
        User user = getUserById(id);

        if (user.getId().equals(adminId) || "divyasreemuppuri@gmail.com".equalsIgnoreCase(user.getEmail()) || user.getRole() == User.Role.ROLE_ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be deleted");
        }

        // Check if user has active borrowings
        long activeBorrows = borrowRepository.countByUserIdAndStatus(id, Borrow.Status.BORROWED);
        long overdueBorrows = borrowRepository.countByUserIdAndStatus(id, Borrow.Status.OVERDUE);
        if (activeBorrows > 0 || overdueBorrows > 0) {
            throw new BadRequestException("Cannot delete member with " + (activeBorrows + overdueBorrows) + " active/overdue book loan(s). All books must be returned first.");
        }

        // Clean up associated records
        fineRepository.deleteAll(fineRepository.findByUserId(id));
        reservationRepository.deleteAll(reservationRepository.findByUserId(id));
        favoriteRepository.deleteAll(favoriteRepository.findByUserId(id));
        userRepository.delete(user);

        activityLogService.log(adminId, adminEmail, "USER_DELETED", "Permanently deleted user " + user.getEmail() + " (" + user.getName() + ")");
    }
}
