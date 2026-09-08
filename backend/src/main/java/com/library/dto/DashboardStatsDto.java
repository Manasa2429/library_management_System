package com.library.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDto {
    private long totalBooks;
    private long availableBooks;
    private long availableCopies;
    private long borrowedBooks;
    private long currentlyBorrowed;
    private long overdueBooks;
    private long pendingRequests;
    private long activeReservations;
    private long totalUsers;
    private long activeMembers;
    private long totalBorrowsAllTime;
    private long totalAuthors;
    private long totalCategories;
    private double totalFines;
    private double totalFinesCollected;
    private double paidFines;
    private double unpaidFines;
    private double unpaidFinesTotal;

    private List<Map<String, Object>> recentRequests;
    private List<Map<String, Object>> recentActivities;
    private Map<String, Long> booksByCategory;
    private Map<String, Long> categoryDistribution;
    private Map<String, Long> monthlyBorrowing;

    private long totalOnlinePayments;
    private double onlinePaymentsCollected;
    private Map<String, Long> paymentMethodDistribution;

    public DashboardStatsDto() {}

    public long getTotalBooks() { return totalBooks; }
    public void setTotalBooks(long totalBooks) { this.totalBooks = totalBooks; }

    public long getAvailableBooks() { return availableBooks; }
    public void setAvailableBooks(long availableBooks) { 
        this.availableBooks = availableBooks; 
        this.availableCopies = availableBooks;
    }

    public long getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(long availableCopies) { 
        this.availableCopies = availableCopies; 
        this.availableBooks = availableCopies;
    }

    public long getBorrowedBooks() { return borrowedBooks; }
    public void setBorrowedBooks(long borrowedBooks) { 
        this.borrowedBooks = borrowedBooks; 
        this.currentlyBorrowed = borrowedBooks;
    }

    public long getCurrentlyBorrowed() { return currentlyBorrowed; }
    public void setCurrentlyBorrowed(long currentlyBorrowed) { 
        this.currentlyBorrowed = currentlyBorrowed; 
        this.borrowedBooks = currentlyBorrowed;
    }

    public long getOverdueBooks() { return overdueBooks; }
    public void setOverdueBooks(long overdueBooks) { this.overdueBooks = overdueBooks; }

    public long getPendingRequests() { return pendingRequests; }
    public void setPendingRequests(long pendingRequests) { this.pendingRequests = pendingRequests; }

    public long getActiveReservations() { return activeReservations; }
    public void setActiveReservations(long activeReservations) { this.activeReservations = activeReservations; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getActiveMembers() { return activeMembers; }
    public void setActiveMembers(long activeMembers) { this.activeMembers = activeMembers; }

    public long getTotalBorrowsAllTime() { return totalBorrowsAllTime; }
    public void setTotalBorrowsAllTime(long totalBorrowsAllTime) { this.totalBorrowsAllTime = totalBorrowsAllTime; }

    public long getTotalAuthors() { return totalAuthors; }
    public void setTotalAuthors(long totalAuthors) { this.totalAuthors = totalAuthors; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public double getTotalFines() { return totalFines; }
    public void setTotalFines(double totalFines) { this.totalFines = totalFines; }

    public double getTotalFinesCollected() { return totalFinesCollected; }
    public void setTotalFinesCollected(double totalFinesCollected) { 
        this.totalFinesCollected = totalFinesCollected; 
        this.paidFines = totalFinesCollected;
    }

    public double getPaidFines() { return paidFines; }
    public void setPaidFines(double paidFines) { 
        this.paidFines = paidFines; 
        this.totalFinesCollected = paidFines;
    }

    public double getUnpaidFines() { return unpaidFines; }
    public void setUnpaidFines(double unpaidFines) { 
        this.unpaidFines = unpaidFines; 
        this.unpaidFinesTotal = unpaidFines;
    }

    public double getUnpaidFinesTotal() { return unpaidFinesTotal; }
    public void setUnpaidFinesTotal(double unpaidFinesTotal) { 
        this.unpaidFinesTotal = unpaidFinesTotal; 
        this.unpaidFines = unpaidFinesTotal;
    }

    public List<Map<String, Object>> getRecentRequests() { return recentRequests; }
    public void setRecentRequests(List<Map<String, Object>> recentRequests) { this.recentRequests = recentRequests; }

    public List<Map<String, Object>> getRecentActivities() { return recentActivities; }
    public void setRecentActivities(List<Map<String, Object>> recentActivities) { this.recentActivities = recentActivities; }

    public Map<String, Long> getBooksByCategory() { return booksByCategory; }
    public void setBooksByCategory(Map<String, Long> booksByCategory) { 
        this.booksByCategory = booksByCategory; 
        this.categoryDistribution = booksByCategory;
    }

    public Map<String, Long> getCategoryDistribution() { return categoryDistribution; }
    public void setCategoryDistribution(Map<String, Long> categoryDistribution) { 
        this.categoryDistribution = categoryDistribution; 
        this.booksByCategory = categoryDistribution;
    }

    public Map<String, Long> getMonthlyBorrowing() { return monthlyBorrowing; }
    public void setMonthlyBorrowing(Map<String, Long> monthlyBorrowing) { this.monthlyBorrowing = monthlyBorrowing; }

    public long getTotalOnlinePayments() { return totalOnlinePayments; }
    public void setTotalOnlinePayments(long totalOnlinePayments) { this.totalOnlinePayments = totalOnlinePayments; }

    public double getOnlinePaymentsCollected() { return onlinePaymentsCollected; }
    public void setOnlinePaymentsCollected(double onlinePaymentsCollected) { this.onlinePaymentsCollected = onlinePaymentsCollected; }

    public Map<String, Long> getPaymentMethodDistribution() { return paymentMethodDistribution; }
    public void setPaymentMethodDistribution(Map<String, Long> paymentMethodDistribution) { this.paymentMethodDistribution = paymentMethodDistribution; }
}
