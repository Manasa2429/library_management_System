package com.library.dto;

import java.util.HashMap;
import java.util.Map;

public class PaymentStatsDto {

    private double totalCollected = 0.0;
    private long totalTransactions = 0;
    private long successfulCount = 0;
    private long pendingCount = 0;
    private long failedCount = 0;
    private long cancelledCount = 0;

    private Map<String, Long> methodDistribution = new HashMap<>();
    private Map<String, Double> monthlyCollection = new HashMap<>();

    public PaymentStatsDto() {}

    public double getTotalCollected() { return totalCollected; }
    public void setTotalCollected(double totalCollected) { this.totalCollected = totalCollected; }

    public long getTotalTransactions() { return totalTransactions; }
    public void setTotalTransactions(long totalTransactions) { this.totalTransactions = totalTransactions; }

    public long getSuccessfulCount() { return successfulCount; }
    public void setSuccessfulCount(long successfulCount) { this.successfulCount = successfulCount; }

    public long getPendingCount() { return pendingCount; }
    public void setPendingCount(long pendingCount) { this.pendingCount = pendingCount; }

    public long getFailedCount() { return failedCount; }
    public void setFailedCount(long failedCount) { this.failedCount = failedCount; }

    public long getCancelledCount() { return cancelledCount; }
    public void setCancelledCount(long cancelledCount) { this.cancelledCount = cancelledCount; }

    public Map<String, Long> getMethodDistribution() { return methodDistribution; }
    public void setMethodDistribution(Map<String, Long> methodDistribution) { this.methodDistribution = methodDistribution; }

    public Map<String, Double> getMonthlyCollection() { return monthlyCollection; }
    public void setMonthlyCollection(Map<String, Double> monthlyCollection) { this.monthlyCollection = monthlyCollection; }
}
