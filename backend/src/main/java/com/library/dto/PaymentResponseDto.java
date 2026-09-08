package com.library.dto;

import java.time.LocalDateTime;
import com.library.model.Payment;
import com.library.model.PaymentMethod;

public class PaymentResponseDto {

    private String id;
    private String fineId;
    private String borrowId;
    private String userId;
    private String userName;
    private String userEmail;
    private String bookId;
    private String bookTitle;
    private double amount;
    private PaymentMethod paymentMethod;
    private String transactionId;
    private Payment.Status status;
    private LocalDateTime createdAt;
    private LocalDateTime paidAt;
    private String failureReason;
    private String notes;

    public PaymentResponseDto() {}

    public static PaymentResponseDto fromEntity(Payment p) {
        if (p == null) return null;
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setId(p.getId());
        dto.setFineId(p.getFineId());
        dto.setBorrowId(p.getBorrowId());
        dto.setUserId(p.getUserId());
        dto.setUserName(p.getUserName());
        dto.setUserEmail(p.getUserEmail());
        dto.setBookId(p.getBookId());
        dto.setBookTitle(p.getBookTitle());
        dto.setAmount(p.getAmount());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setTransactionId(p.getTransactionId());
        dto.setStatus(p.getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        dto.setPaidAt(p.getPaidAt());
        dto.setFailureReason(p.getFailureReason());
        dto.setNotes(p.getNotes());
        return dto;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFineId() { return fineId; }
    public void setFineId(String fineId) { this.fineId = fineId; }

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

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public Payment.Status getStatus() { return status; }
    public void setStatus(Payment.Status status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getPaidAt() { return paidAt; }
    public void setPaidAt(LocalDateTime paidAt) { this.paidAt = paidAt; }

    public String getFailureReason() { return failureReason; }
    public void setFailureReason(String failureReason) { this.failureReason = failureReason; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
