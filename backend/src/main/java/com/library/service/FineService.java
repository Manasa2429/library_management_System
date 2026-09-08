package com.library.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.model.Fine;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.FineRepository;
import com.library.repository.UserRepository;

@Service
public class FineService {

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private ActivityLogService activityLogService;

    @Autowired
    private NotificationService notificationService;

    public List<Fine> getAllFines() {
        return fineRepository.findAll();
    }

    public List<Fine> getFinesByUserId(String userId) {
        return fineRepository.findByUserId(userId);
    }

    public List<Fine> getUnpaidFines() {
        return fineRepository.findByStatus(Fine.Status.UNPAID);
    }

    public Fine createOrUpdateFine(String borrowId, String userId, String userName, String userEmail,
                                   String bookId, String bookTitle, long overdueDays, double fineAmount) {
        Fine fine = fineRepository.findByBorrowId(borrowId).orElse(null);
        if (fine == null) {
            fine = new Fine(borrowId, userId, userName, userEmail, bookId, bookTitle, overdueDays, fineAmount);
        } else {
            fine.setOverdueDays(overdueDays);
            fine.setFineAmount(fineAmount);
        }
        return fineRepository.save(fine);
    }

    public Fine markFineAsPaid(String fineId, String adminEmail, String adminId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with ID: " + fineId));

        if (fine.getStatus() == Fine.Status.PAID) {
            throw new BadRequestException("Fine is already marked as PAID");
        }

        fine.setStatus(Fine.Status.PAID);
        fine.setSettledAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        // Update corresponding Borrow record if it exists
        borrowRepository.findById(fine.getBorrowId()).ifPresent(b -> {
            b.setFineStatus(Borrow.FineStatus.PAID);
            borrowRepository.save(b);
        });

        notificationService.createNotification(
                fine.getUserId(),
                "Fine Payment Recorded",
                "Your fine of ₹" + fine.getFineAmount() + " for '" + fine.getBookTitle() + "' has been marked as PAID.",
                "FINE_GENERATED"
        );

        activityLogService.log(adminId, adminEmail, "FINE_PAID", "Marked fine ₹" + fine.getFineAmount() + " as PAID for user " + fine.getUserEmail());
        return saved;
    }

    public Fine waiveFine(String fineId, String adminEmail, String adminId) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with ID: " + fineId));

        fine.setStatus(Fine.Status.WAIVED);
        fine.setSettledAt(LocalDateTime.now());
        Fine saved = fineRepository.save(fine);

        borrowRepository.findById(fine.getBorrowId()).ifPresent(b -> {
            b.setFineStatus(Borrow.FineStatus.WAIVED);
            borrowRepository.save(b);
        });

        notificationService.createNotification(
                fine.getUserId(),
                "Fine Waived",
                "Your fine of ₹" + fine.getFineAmount() + " for '" + fine.getBookTitle() + "' has been WAIVED by administrator.",
                "FINE_GENERATED"
        );

        activityLogService.log(adminId, adminEmail, "FINE_WAIVED", "Waived fine of ₹" + fine.getFineAmount() + " for user " + fine.getUserEmail());
        return saved;
    }

    public double getTotalUnpaidFines() {
        return fineRepository.findByStatus(Fine.Status.UNPAID).stream()
                .mapToDouble(Fine::getFineAmount)
                .sum();
    }

    public double getTotalFines() {
        return fineRepository.findAll().stream()
                .mapToDouble(Fine::getFineAmount)
                .sum();
    }

    public Fine generateDemoFineForUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        List<Book> books = bookRepository.findAll();
        if (books.isEmpty()) {
            throw new BadRequestException("No books available in library to generate demo fine");
        }

        List<Fine> userFines = fineRepository.findByUserId(userId);
        Book selectedBook = books.stream()
                .filter(b -> userFines.stream().noneMatch(f -> f.getBookId().equals(b.getId()) && f.getStatus() == Fine.Status.UNPAID))
                .findFirst()
                .orElse(books.get((int) (Math.random() * books.size())));

        long overdueDays = 3 + (long) (Math.random() * 5); // 3 to 7 days
        double fineAmount = overdueDays * 10.0; // ₹30 to ₹70

        Borrow sampleBorrow = new Borrow();
        sampleBorrow.setUserId(user.getId());
        sampleBorrow.setUserName(user.getName());
        sampleBorrow.setUserEmail(user.getEmail());
        sampleBorrow.setBookId(selectedBook.getId());
        sampleBorrow.setBookTitle(selectedBook.getTitle());
        sampleBorrow.setBookCover(selectedBook.getImage());
        sampleBorrow.setStatus(Borrow.Status.RETURNED);
        sampleBorrow.setRequestDate(LocalDate.now().minusDays(14 + overdueDays));
        sampleBorrow.setIssueDate(LocalDate.now().minusDays(14 + overdueDays));
        sampleBorrow.setDueDate(LocalDate.now().minusDays(overdueDays));
        sampleBorrow.setReturnDate(LocalDate.now().minusDays(1));
        sampleBorrow.setFineAmount(fineAmount);
        sampleBorrow.setFineStatus(Borrow.FineStatus.UNPAID);
        Borrow savedBorrow = borrowRepository.save(sampleBorrow);

        Fine fine = new Fine(
                savedBorrow.getId(),
                user.getId(),
                user.getName(),
                user.getEmail(),
                selectedBook.getId(),
                selectedBook.getTitle(),
                overdueDays,
                fineAmount
        );
        Fine savedFine = fineRepository.save(fine);

        notificationService.createNotification(
                user.getId(),
                "Overdue Fine Incurred",
                "A demo fine of ₹" + fineAmount + " was generated for '" + selectedBook.getTitle() + "'. You can settle it online.",
                "FINE_GENERATED"
        );

        return savedFine;
    }

    public List<Fine> generateDemoFinesForAllUsers() {
        List<Fine> created = new ArrayList<>();
        List<User> readers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.Role.ROLE_USER)
                .toList();

        for (User reader : readers) {
            created.add(generateDemoFineForUser(reader.getId()));
        }
        return created;
    }
}
