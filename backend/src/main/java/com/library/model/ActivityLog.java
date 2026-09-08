package com.library.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "activity_logs")
public class ActivityLog {

    @Id
    private String id;

    private String userId;
    private String userEmail;
    private String action; // USER_REGISTERED, USER_LOGIN, BOOK_ADDED, BOOK_BORROWED, etc.
    private String description;

    @CreatedDate
    private LocalDateTime timestamp = LocalDateTime.now();

    public ActivityLog() {}

    public ActivityLog(String userId, String userEmail, String action, String description) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.action = action;
        this.description = description;
        this.timestamp = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
