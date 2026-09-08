package com.library.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.exception.BadRequestException;
import com.library.exception.ConflictException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.model.Reservation;
import com.library.model.SystemSetting;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemSettingService systemSettingService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    public Reservation joinWaitlist(String userId, String bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + bookId));

        if (book.getAvailableCopies() > 0) {
            throw new BadRequestException("Copies of '" + book.getTitle() + "' are currently available! You can borrow directly instead of joining the waitlist.");
        }

        // Prevent duplicate active waitlist entry
        reservationRepository.findByUserIdAndBookIdAndStatus(userId, bookId, Reservation.Status.ACTIVE)
                .ifPresent(r -> {
                    throw new ConflictException("You are already on the active waitlist for this book.");
                });

        Reservation reservation = new Reservation(
                user.getId(),
                user.getName(),
                user.getEmail(),
                book.getId(),
                book.getTitle(),
                book.getImage()
        );

        Reservation saved = reservationRepository.save(reservation);

        notificationService.createNotification(
                user.getId(),
                "Waitlist Confirmed",
                "You have joined the waitlist for '" + book.getTitle() + "'. We will notify you once a copy is returned.",
                "RESERVATION_AVAILABLE"
        );

        activityLogService.log(user.getId(), user.getEmail(), "WAITLIST_JOINED", "Joined waitlist for book '" + book.getTitle() + "'");
        return saved;
    }

    public void cancelReservation(String reservationId, String userId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with ID: " + reservationId));

        if (!reservation.getUserId().equals(userId)) {
            throw new BadRequestException("You can only cancel your own reservations");
        }

        reservation.setStatus(Reservation.Status.CANCELLED);
        reservationRepository.save(reservation);

        activityLogService.log(userId, reservation.getUserEmail(), "WAITLIST_CANCELLED", "Cancelled waitlist for '" + reservation.getBookTitle() + "'");
    }

    public void notifyNextInWaitlist(String bookId) {
        List<Reservation> queue = reservationRepository.findByBookIdAndStatusOrderByReservationDateAsc(
                bookId, Reservation.Status.ACTIVE);

        if (!queue.isEmpty()) {
            Reservation next = queue.get(0);
            SystemSetting settings = systemSettingService.getSettings();

            next.setStatus(Reservation.Status.NOTIFIED);
            next.setExpiryDate(LocalDate.now().plusDays(settings.getReservationExpiryDays()));
            reservationRepository.save(next);

            String message = "A copy of '" + next.getBookTitle() + "' is now available for you! Please submit your borrow request before " + next.getExpiryDate() + ".";

            notificationService.createNotification(
                    next.getUserId(),
                    "Book Available from Waitlist!",
                    message,
                    "RESERVATION_AVAILABLE"
            );

            emailService.sendEmail(
                    next.getUserEmail(),
                    "Your Reserved Book is Now Available!",
                    "Hello " + next.getUserName() + ",\n\n" + message + "\n\nSmartLibrary"
            );

            activityLogService.log("SYSTEM", "system@library.com", "WAITLIST_NOTIFIED", "Notified user " + next.getUserEmail() + " of available copy for '" + next.getBookTitle() + "'");
        }
    }

    public List<Reservation> getUserReservations(String userId) {
        return reservationRepository.findByUserIdOrderByReservationDateDesc(userId);
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }
}
