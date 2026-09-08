package com.library.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "reservations")
public class Reservation {

    @Id
    private String id;

    private String userId;
    private String userName;
    private String userEmail;

    private String bookId;
    private String bookTitle;
    private String bookCover;

    private LocalDate reservationDate;
    private LocalDate expiryDate;

    private Status status = Status.ACTIVE;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status {
        ACTIVE,
        NOTIFIED,
        FULFILLED,
        CANCELLED,
        EXPIRED
    }

    public Reservation() {}

    public Reservation(String userId, String userName, String userEmail, String bookId, String bookTitle, String bookCover) {
        this.userId = userId;
        this.userName = userName;
        this.userEmail = userEmail;
        this.bookId = bookId;
        this.bookTitle = bookTitle;
        this.bookCover = bookCover;
        this.reservationDate = LocalDate.now();
        this.status = Status.ACTIVE;
        this.createdAt = LocalDateTime.now();
    }

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

    public LocalDate getReservationDate() { return reservationDate; }
    public void setReservationDate(LocalDate reservationDate) { this.reservationDate = reservationDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
