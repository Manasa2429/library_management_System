package com.library.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "system_settings")
public class SystemSetting {

    @Id
    private String id = "SYSTEM_SETTINGS";

    private double finePerDay = 10.0;
    private int borrowDurationDays = 14;
    private int reservationExpiryDays = 3;
    private int maxBooksPerUser = 5;

    public SystemSetting() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public double getFinePerDay() { return finePerDay; }
    public void setFinePerDay(double finePerDay) { this.finePerDay = finePerDay; }

    public int getBorrowDurationDays() { return borrowDurationDays; }
    public void setBorrowDurationDays(int borrowDurationDays) { this.borrowDurationDays = borrowDurationDays; }

    public int getReservationExpiryDays() { return reservationExpiryDays; }
    public void setReservationExpiryDays(int reservationExpiryDays) { this.reservationExpiryDays = reservationExpiryDays; }

    public int getMaxBooksPerUser() { return maxBooksPerUser; }
    public void setMaxBooksPerUser(int maxBooksPerUser) { this.maxBooksPerUser = maxBooksPerUser; }
}
