package com.library.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.library.dto.BorrowRequestDto;
import com.library.exception.BadRequestException;
import com.library.exception.ConflictException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.model.SystemSetting;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.UserRepository;

@Service
public class BorrowService {

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SystemSettingService systemSettingService;

    @Autowired
    private FineService fineService;

    @Autowired
    private ReservationService reservationService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private ActivityLogService activityLogService;

    @Transactional
    public Borrow requestBorrow(String userId, BorrowRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (!user.isActive()) {
            throw new BadRequestException("Your account is currently inactive or blocked. Please contact the administrator.");
        }

        Book book = bookRepository.findById(dto.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + dto.getBookId()));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No available copies of '" + book.getTitle() + "'. You can join the waitlist instead.");
        }

        SystemSetting settings = systemSettingService.getSettings();
        long activeCount = borrowRepository.countByUserIdAndStatus(userId, Borrow.Status.BORROWED)
                + borrowRepository.countByUserIdAndStatus(userId, Borrow.Status.APPROVED)
                + borrowRepository.countByUserIdAndStatus(userId, Borrow.Status.PENDING);

        if (activeCount >= settings.getMaxBooksPerUser()) {
            throw new BadRequestException("You have reached your maximum limit of " + settings.getMaxBooksPerUser() + " borrowed / pending books.");
        }

        // Check if already requested or borrowed
        List<Borrow> activeForBook = borrowRepository.findByBookIdAndStatus(book.getId(), Borrow.Status.PENDING);
        for (Borrow b : activeForBook) {
            if (b.getUserId().equals(userId)) {
                throw new ConflictException("You already have a pending borrow request for this book.");
            }
        }

        List<Borrow> borrowedForBook = borrowRepository.findByBookIdAndStatus(book.getId(), Borrow.Status.BORROWED);
        for (Borrow b : borrowedForBook) {
            if (b.getUserId().equals(userId)) {
                throw new ConflictException("You currently have an active borrowed copy of this book.");
            }
        }

        Borrow borrow = new Borrow(
                user.getId(),
                user.getName(),
                user.getEmail(),
                book.getId(),
                book.getTitle(),
                book.getImage()
        );
        borrow.setNotes(dto.getNotes());
        borrow.setStatus(Borrow.Status.PENDING);

        Borrow saved = borrowRepository.save(borrow);

        notificationService.createNotification(
                user.getId(),
                "Borrow Request Submitted",
                "Your borrow request for '" + book.getTitle() + "' has been submitted and is awaiting administrator approval.",
                "BORROW_REQUEST"
        );

        activityLogService.log(user.getId(), user.getEmail(), "BORROW_REQUESTED", "User requested to borrow book: '" + book.getTitle() + "'");
        return saved;
    }

    @Transactional
    public Borrow approveBorrow(String borrowId, String adminEmail, String adminId) {
        Borrow borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (borrow.getStatus() != Borrow.Status.PENDING) {
            throw new BadRequestException("Only PENDING borrow requests can be approved. Current status: " + borrow.getStatus());
        }

        Book book = bookRepository.findById(borrow.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("Cannot approve: No available copies left for '" + book.getTitle() + "'.");
        }

        // Decrement available copies
        book.setAvailableCopies(Math.max(0, book.getAvailableCopies() - 1));
        bookRepository.save(book);

        SystemSetting settings = systemSettingService.getSettings();
        LocalDate now = LocalDate.now();
        LocalDate dueDate = now.plusDays(settings.getBorrowDurationDays());

        borrow.setStatus(Borrow.Status.BORROWED);
        borrow.setApprovalDate(now);
        borrow.setIssueDate(now);
        borrow.setDueDate(dueDate);
        borrow.setUpdatedAt(LocalDateTime.now());

        Borrow saved = borrowRepository.save(borrow);

        String message = "Your borrow request for '" + book.getTitle() + "' has been APPROVED! It is due for return by " + dueDate + ".";
        notificationService.createNotification(borrow.getUserId(), "Borrow Request Approved", message, "BORROW_APPROVED");
        emailService.sendEmail(borrow.getUserEmail(), "Book Borrow Request Approved - SmartLibrary", "Hello " + borrow.getUserName() + ",\n\n" + message + "\n\nEnjoy your reading!");

        activityLogService.log(adminId, adminEmail, "BORROW_APPROVED", "Approved borrow for '" + book.getTitle() + "' to user " + borrow.getUserEmail());
        return saved;
    }

    @Transactional
    public Borrow rejectBorrow(String borrowId, String reason, String adminEmail, String adminId) {
        Borrow borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (borrow.getStatus() != Borrow.Status.PENDING) {
            throw new BadRequestException("Only PENDING borrow requests can be rejected. Current status: " + borrow.getStatus());
        }

        borrow.setStatus(Borrow.Status.REJECTED);
        borrow.setNotes(reason != null && !reason.trim().isEmpty() ? reason : "Borrow request rejected by library administrator.");
        borrow.setUpdatedAt(LocalDateTime.now());

        Borrow saved = borrowRepository.save(borrow);

        String message = "Your borrow request for '" + borrow.getBookTitle() + "' was rejected. Reason: " + borrow.getNotes();
        notificationService.createNotification(borrow.getUserId(), "Borrow Request Rejected", message, "BORROW_REJECTED");
        emailService.sendEmail(borrow.getUserEmail(), "Borrow Request Update - SmartLibrary", "Hello " + borrow.getUserName() + ",\n\n" + message);

        activityLogService.log(adminId, adminEmail, "BORROW_REJECTED", "Rejected borrow for '" + borrow.getBookTitle() + "' requested by " + borrow.getUserEmail());
        return saved;
    }

    @Transactional
    public Borrow returnBook(String borrowId, String actionUserEmail, String actionUserId) {
        Borrow borrow = borrowRepository.findById(borrowId)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found with ID: " + borrowId));

        if (borrow.getStatus() != Borrow.Status.BORROWED && borrow.getStatus() != Borrow.Status.OVERDUE) {
            throw new BadRequestException("Book cannot be returned. Current status: " + borrow.getStatus());
        }

        LocalDate returnDate = LocalDate.now();
        borrow.setReturnDate(returnDate);
        borrow.setStatus(Borrow.Status.RETURNED);

        // Check if overdue and calculate fine
        if (borrow.getDueDate() != null && returnDate.isAfter(borrow.getDueDate())) {
            long overdueDays = ChronoUnit.DAYS.between(borrow.getDueDate(), returnDate);
            SystemSetting settings = systemSettingService.getSettings();
            double fineAmount = overdueDays * settings.getFinePerDay();

            borrow.setFineAmount(fineAmount);
            borrow.setFineStatus(Borrow.FineStatus.UNPAID);

            fineService.createOrUpdateFine(
                    borrow.getId(),
                    borrow.getUserId(),
                    borrow.getUserName(),
                    borrow.getUserEmail(),
                    borrow.getBookId(),
                    borrow.getBookTitle(),
                    overdueDays,
                    fineAmount
            );

            notificationService.createNotification(
                    borrow.getUserId(),
                    "Overdue Fine Incurred",
                    "A fine of ₹" + fineAmount + " was generated for returning '" + borrow.getBookTitle() + "' " + overdueDays + " days late.",
                    "FINE_GENERATED"
            );
        }

        borrow.setUpdatedAt(LocalDateTime.now());
        Borrow saved = borrowRepository.save(borrow);

        // Increment book copies
        bookRepository.findById(borrow.getBookId()).ifPresent(b -> {
            b.setAvailableCopies(Math.min(b.getTotalCopies(), b.getAvailableCopies() + 1));
            bookRepository.save(b);
            // Notify next user in waitlist
            reservationService.notifyNextInWaitlist(b.getId());
        });

        notificationService.createNotification(
                borrow.getUserId(),
                "Book Returned",
                "Your return of '" + borrow.getBookTitle() + "' has been processed successfully.",
                "BOOK_RETURNED"
        );

        activityLogService.log(actionUserId, actionUserEmail, "BOOK_RETURNED", "Book returned: '" + borrow.getBookTitle() + "' by user " + borrow.getUserEmail());
        return saved;
    }

    public List<Borrow> getMyRequests(String userId) {
        return borrowRepository.findByUserIdOrderByRequestDateDesc(userId);
    }

    public List<Borrow> getMyActiveBorrows(String userId) {
        return borrowRepository.findByUserIdAndStatus(userId, Borrow.Status.BORROWED);
    }

    public List<Borrow> getMyBorrowHistory(String userId) {
        return borrowRepository.findByUserIdAndStatus(userId, Borrow.Status.RETURNED);
    }

    public List<Borrow> getPendingRequests() {
        return borrowRepository.findByStatus(Borrow.Status.PENDING);
    }

    public List<Borrow> getActiveBorrows() {
        return borrowRepository.findByStatus(Borrow.Status.BORROWED);
    }

    public List<Borrow> getOverdueBorrows() {
        return borrowRepository.findByStatus(Borrow.Status.OVERDUE);
    }

    public List<Borrow> getAllBorrows() {
        return borrowRepository.findAll();
    }
}
