package com.library.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.dto.DashboardStatsDto;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.model.Category;
import com.library.model.Fine;
import com.library.model.Payment;
import com.library.model.Reservation;
import com.library.model.User;
import com.library.repository.ActivityLogRepository;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.FineRepository;
import com.library.repository.PaymentRepository;
import com.library.repository.ReservationRepository;
import com.library.repository.UserRepository;

@Service
public class ReportService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        List<Book> allBooks = bookRepository.findAll();
        long totalBooks = allBooks.size();
        long availableBooks = allBooks.stream().mapToLong(Book::getAvailableCopies).sum();

        stats.setTotalBooks(totalBooks);
        stats.setAvailableBooks(availableBooks);
        stats.setAvailableCopies(availableBooks);

        long borrowed = borrowRepository.countByStatus(Borrow.Status.BORROWED);
        stats.setBorrowedBooks(borrowed);
        stats.setCurrentlyBorrowed(borrowed);

        stats.setOverdueBooks(borrowRepository.countByStatus(Borrow.Status.OVERDUE));
        stats.setPendingRequests(borrowRepository.countByStatus(Borrow.Status.PENDING));
        stats.setActiveReservations(reservationRepository.countByStatus(Reservation.Status.ACTIVE));

        long usersCount = userRepository.countByRole(User.Role.ROLE_USER);
        long activeMembers = userRepository.countByRoleAndActive(User.Role.ROLE_USER, true);
        stats.setTotalUsers(usersCount);
        stats.setActiveMembers(activeMembers);

        stats.setTotalBorrowsAllTime(borrowRepository.count());

        stats.setTotalAuthors(authorRepository.count());
        stats.setTotalCategories(categoryRepository.count());

        List<Fine> fines = fineRepository.findAll();
        stats.setTotalFines(fines.stream().mapToDouble(Fine::getFineAmount).sum());
        double paidFines = fines.stream()
                .filter(f -> f.getStatus() == Fine.Status.PAID)
                .mapToDouble(Fine::getFineAmount)
                .sum();
        double unpaidFines = fines.stream()
                .filter(f -> f.getStatus() == Fine.Status.UNPAID)
                .mapToDouble(Fine::getFineAmount)
                .sum();
        stats.setTotalFinesCollected(paidFines);
        stats.setPaidFines(paidFines);
        stats.setUnpaidFines(unpaidFines);
        stats.setUnpaidFinesTotal(unpaidFines);

        // Payment stats
        List<Payment> allPayments = paymentRepository.findAll();
        long successfulPayments = allPayments.stream().filter(p -> p.getStatus() == Payment.Status.SUCCESS).count();
        double onlineCollected = allPayments.stream()
                .filter(p -> p.getStatus() == Payment.Status.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
        stats.setTotalOnlinePayments(successfulPayments);
        stats.setOnlinePaymentsCollected(onlineCollected);

        Map<String, Long> methodDist = new HashMap<>();
        for (Payment p : allPayments) {
            if (p.getStatus() == Payment.Status.SUCCESS && p.getPaymentMethod() != null) {
                String mName = p.getPaymentMethod().name();
                methodDist.put(mName, methodDist.getOrDefault(mName, 0L) + 1L);
            }
        }
        stats.setPaymentMethodDistribution(methodDist);

        // Category breakdown
        Map<String, Long> catMap = new HashMap<>();
        List<Category> categories = categoryRepository.findAll();
        for (Category c : categories) {
            catMap.put(c.getName(), bookRepository.countByCategoryId(c.getId()));
        }
        stats.setBooksByCategory(catMap);
        stats.setCategoryDistribution(catMap);

        // Recent Requests (last 5)
        List<Borrow> pending = borrowRepository.findByStatus(Borrow.Status.PENDING);
        List<Map<String, Object>> recentRequests = pending.stream().limit(5).map(b -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", b.getId());
            map.put("bookTitle", b.getBookTitle());
            map.put("userName", b.getUserName());
            map.put("userEmail", b.getUserEmail());
            map.put("requestDate", b.getRequestDate());
            map.put("status", b.getStatus());
            return map;
        }).collect(Collectors.toList());
        stats.setRecentRequests(recentRequests);

        // Recent Activities (last 6)
        List<Map<String, Object>> recentActs = activityLogRepository.findTop20ByOrderByTimestampDesc().stream().limit(6).map(a -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", a.getId());
            map.put("action", a.getAction());
            map.put("description", a.getDescription());
            map.put("userEmail", a.getUserEmail());
            map.put("timestamp", a.getTimestamp());
            return map;
        }).collect(Collectors.toList());
        stats.setRecentActivities(recentActs);

        // Monthly borrowing stats (sample groupings based on borrow history)
        Map<String, Long> monthly = new HashMap<>();
        List<Borrow> allBorrows = borrowRepository.findAll();
        DateTimeFormatter monthYearFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (Borrow b : allBorrows) {
            if (b.getIssueDate() != null) {
                String key = b.getIssueDate().format(monthYearFmt);
                monthly.put(key, monthly.getOrDefault(key, 0L) + 1L);
            } else if (b.getRequestDate() != null) {
                String key = b.getRequestDate().format(monthYearFmt);
                monthly.put(key, monthly.getOrDefault(key, 0L) + 1L);
            }
        }
        stats.setMonthlyBorrowing(monthly);

        return stats;
    }

    public ByteArrayInputStream exportBooksToCsv() {
        List<Book> books = bookRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("ID,Title,ISBN,Author,Category,Publisher,Year,Shelf,Total Copies,Available Copies,Status");
            for (Book b : books) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%d,%d,\"%s\"%n",
                        b.getId(),
                        escapeCsv(b.getTitle()),
                        escapeCsv(b.getIsbn() != null ? b.getIsbn() : ""),
                        escapeCsv(b.getAuthorName() != null ? b.getAuthorName() : ""),
                        escapeCsv(b.getCategoryName() != null ? b.getCategoryName() : ""),
                        escapeCsv(b.getPublisherName() != null ? b.getPublisherName() : ""),
                        b.getPublicationYear() != null ? b.getPublicationYear().toString() : "",
                        escapeCsv(b.getShelf() != null ? b.getShelf() : ""),
                        b.getTotalCopies(),
                        b.getAvailableCopies(),
                        b.getStatus()
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream exportBorrowsToCsv() {
        List<Borrow> borrows = borrowRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("ID,User Name,User Email,Book Title,Status,Request Date,Issue Date,Due Date,Return Date,Fine Amount,Fine Status");
            for (Borrow b : borrows) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\"%n",
                        b.getId(),
                        escapeCsv(b.getUserName()),
                        escapeCsv(b.getUserEmail()),
                        escapeCsv(b.getBookTitle()),
                        b.getStatus(),
                        b.getRequestDate() != null ? b.getRequestDate().toString() : "",
                        b.getIssueDate() != null ? b.getIssueDate().toString() : "",
                        b.getDueDate() != null ? b.getDueDate().toString() : "",
                        b.getReturnDate() != null ? b.getReturnDate().toString() : "",
                        b.getFineAmount(),
                        b.getFineStatus()
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream exportPaymentsToCsv() {
        List<Payment> payments = paymentRepository.findAllByOrderByCreatedAtDesc();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (PrintWriter writer = new PrintWriter(out)) {
            writer.println("ID,Transaction ID,User Name,User Email,Book Title,Amount,Payment Method,Status,Created Date,Paid Date,Failure Reason");
            for (Payment p : payments) {
                writer.printf("\"%s\",\"%s\",\"%s\",\"%s\",\"%s\",%.2f,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                        p.getId(),
                        escapeCsv(p.getTransactionId()),
                        escapeCsv(p.getUserName()),
                        escapeCsv(p.getUserEmail()),
                        escapeCsv(p.getBookTitle()),
                        p.getAmount(),
                        p.getPaymentMethod() != null ? p.getPaymentMethod().name() : "",
                        p.getStatus() != null ? p.getStatus().name() : "",
                        p.getCreatedAt() != null ? p.getCreatedAt().toString() : "",
                        p.getPaidAt() != null ? p.getPaidAt().toString() : "",
                        escapeCsv(p.getFailureReason() != null ? p.getFailureReason() : "")
                );
            }
            writer.flush();
        }
        return new ByteArrayInputStream(out.toByteArray());
    }

    private String escapeCsv(String val) {
        if (val == null) return "";
        return val.replace("\"", "\"\"");
    }
}
