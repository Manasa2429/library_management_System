package com.library.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "borrows")
public class Borrow {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private String bookId;
    private String bookTitle;
    private String bookCover;

    private LocalDate requestDate;
    private LocalDate approvalDate;
    private LocalDate issueDate;
    private LocalDate dueDate;
    private LocalDate returnDate;

    private Status status = Status.PENDING;

    private double fineAmount = 0.0;
    private FineStatus fineStatus = FineStatus.NONE;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    @LastModifiedDate
    private LocalDateTime updatedAt = LocalDateTime.now();

    public enum Status {
        PENDING,
        APPROVED,
        BORROWED,
        RETURNED,
        REJECTED,
        OVERDUE
    }

    public enum FineStatus {
        NONE,
        UNPAID,
        PAID,
        WAIVED
    }

    public Borrow() {}

    public Borrow(String userId, String userName, String userEmail, String bookId, String bookTitle, String bookCover) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookCover = bookCover;
        this.requestDate = LocalDate.now();
        this.status = Status.PENDING;
        this.fineAmount = 0.0;
        this.fineStatus = FineStatus.NONE;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

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

    public String getBookCover() { return bookCover; }
    public void setBookCover(String bookCover) { this.bookCover = bookCover; }

    public LocalDate getRequestDate() { return requestDate; }
    public void setRequestDate(LocalDate requestDate) { this.requestDate = requestDate; }

    public LocalDate getApprovalDate() { return approvalDate; }
    public void setApprovalDate(LocalDate approvalDate) { this.approvalDate = approvalDate; }

    public LocalDate getIssueDate() { return issueDate; }
    public void setIssueDate(LocalDate issueDate) { this.issueDate = issueDate; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public double getFineAmount() { return fineAmount; }
    public void setFineAmount(double fineAmount) { this.fineAmount = fineAmount; }

    public FineStatus getFineStatus() { return fineStatus; }
    public void setFineStatus(FineStatus fineStatus) { this.fineStatus = fineStatus; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
