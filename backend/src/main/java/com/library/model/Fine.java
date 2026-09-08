package com.library.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "fines")
public class Fine {

    @Id
    private String id;

    private String borrowId;
    private String userId;
    private String userName;
    private String userEmail;

    private String bookId;
    private String bookTitle;

    private long overdueDays;
    private double fineAmount;

    private Status status = Status.UNPAID;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime settledAt;

    public enum Status {
        UNPAID,
        PAID,
        WAIVED
    }

    public Fine() {}

    public Fine(String borrowId, String userId, String userName, String userEmail, String bookId, String bookTitle, long overdueDays, double fineAmount) {
        this.borrowId = borrowId;
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.overdueDays = overdueDays;
        this.fineAmount = fineAmount;
        this.status = Status.UNPAID;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBorrowId() { return borrowId; }
    public void setBorrowId(String borrowId) { this.borrowId = borrowId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getBookTitle() { return bookTitle; }
    public void setBookTitle(String bookTitle) { this.bookTitle = bookTitle; }

    public long getOverdueDays() { return overdueDays; }
    public void setOverdueDays(long overdueDays) { this.overdueDays = overdueDays; }

    public double getFineAmount() { return fineAmount; }
    public void setFineAmount(double fineAmount) { this.fineAmount = fineAmount; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getSettledAt() { return settledAt; }
    public void setSettledAt(LocalDateTime settledAt) { this.settledAt = settledAt; }
}
