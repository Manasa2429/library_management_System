package com.library.scheduler;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import com.library.model.Borrow;
import com.library.model.Reservation;
import com.library.model.SystemSetting;
import com.library.repository.BorrowRepository;
import com.library.repository.ReservationRepository;
import com.library.service.ActivityLogService;
import com.library.service.EmailService;
import com.library.service.FineService;
import com.library.service.NotificationService;
import com.library.service.SystemSettingService;

@Component
public class LibraryScheduledTasks {

    private static final Logger logger = LoggerFactory.getLogger(LibraryScheduledTasks.class);

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private SystemSettingService systemSettingService;

    @Autowired
    private FineService fineService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    // Run every night at 1:00 AM (and every hour during active operations if needed)
    @Scheduled(cron = "0 0 1 * * ?")
    public void processDailyLibraryTasks() {
        logger.info("Executing scheduled daily library maintenance tasks...");
        checkOverdueBooks();
        checkDueSoonBooks();
        expireReservations();
    }

    public void checkOverdueBooks() {
        LocalDate today = LocalDate.now();
        List<Borrow> activeBorrows = borrowRepository.findByStatus(Borrow.Status.BORROWED);
        SystemSetting settings = systemSettingService.getSettings();

        for (Borrow b : activeBorrows) {
            if (b.getDueDate() != null && today.isAfter(b.getDueDate())) {
                long overdueDays = ChronoUnit.DAYS.between(b.getDueDate(), today);
                double fineAmount = overdueDays * settings.getFinePerDay();

                b.setStatus(Borrow.Status.OVERDUE);
                b.setFineAmount(fineAmount);
                b.setFineStatus(Borrow.FineStatus.UNPAID);
                borrowRepository.save(b);

                fineService.createOrUpdateFine(
                        b.getId(),
                        b.getUserId(),
                        b.getUserName(),
                        b.getUserEmail(),
                        b.getBookId(),
                        b.getBookTitle(),
                        overdueDays,
                        fineAmount
                );

                String msg = "Your borrowed book '" + b.getBookTitle() + "' is " + overdueDays + " day(s) overdue. Current fine: ₹" + fineAmount + ". Please return it promptly.";
                notificationService.createNotification(b.getUserId(), "Book Overdue Alert", msg, "BOOK_OVERDUE");
                emailService.sendEmail(b.getUserEmail(), "Overdue Book Notification - SmartLibrary", "Hello " + b.getUserName() + ",\n\n" + msg);
            }
        }
    }

    public void checkDueSoonBooks() {
        LocalDate today = LocalDate.now();
        LocalDate dueSoonDate = today.plusDays(2);
        List<Borrow> activeBorrows = borrowRepository.findByStatus(Borrow.Status.BORROWED);

        for (Borrow b : activeBorrows) {
            if (b.getDueDate() != null && b.getDueDate().isEqual(dueSoonDate)) {
                String msg = "Reminder: Your borrowed book '" + b.getBookTitle() + "' is due in 2 days (" + b.getDueDate() + ").";
                notificationService.createNotification(b.getUserId(), "Book Due Soon", msg, "BOOK_DUE_SOON");
                emailService.sendEmail(b.getUserEmail(), "Book Due Soon Reminder - SmartLibrary", "Hello " + b.getUserName() + ",\n\n" + msg);
            }
        }
    }

    public void expireReservations() {
        LocalDate today = LocalDate.now();
        List<Reservation> notified = reservationRepository.findByStatus(Reservation.Status.NOTIFIED);

        for (Reservation r : notified) {
            if (r.getExpiryDate() != null && today.isAfter(r.getExpiryDate())) {
                r.setStatus(Reservation.Status.EXPIRED);
                reservationRepository.save(r);

                notificationService.createNotification(
                        r.getUserId(),
                        "Waitlist Offer Expired",
                        "Your waitlist hold on '" + r.getBookTitle() + "' has expired.",
                        "RESERVATION_AVAILABLE"
                );
            }
        }
    }
}
