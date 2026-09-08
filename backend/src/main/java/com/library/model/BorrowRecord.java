package com.library.model;

import java.time.LocalDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "borrow_records")
public class BorrowRecord {

    @Id
    private String id;

    private Book book;
    private Member member;

    private LocalDate borrowDate;
    private LocalDate returnDate;
    private Status status;

    public enum Status {
        BORROWED, RETURNED, LATE
    }

    public BorrowRecord() {}

    public BorrowRecord(Book book, Member member, LocalDate borrowDate, Status status) {
        this.book = book;
        this.member = member;
        this.borrowDate = borrowDate;
        this.status = status;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Book getBook() { return book; }
    public void setBook(Book book) { this.book = book; }

    public Member getMember() { return member; }
    public void setMember(Member member) { this.member = member; }

    public LocalDate getBorrowDate() { return borrowDate; }
    public void setBorrowDate(LocalDate borrowDate) { this.borrowDate = borrowDate; }

    public LocalDate getReturnDate() { return returnDate; }
    public void setReturnDate(LocalDate returnDate) { this.returnDate = returnDate; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }
}
