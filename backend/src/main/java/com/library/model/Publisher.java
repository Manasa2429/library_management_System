package com.library.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "publishers")
public class Publisher {

    @Id
    private String id;
    private String name;
    private String bio;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    public Publisher() {}

    public Publisher(String id, String name, String bio) {
        this.id = id;
        this.name = name;
        this.bio = bio;
        this.createdAt = LocalDateTime.now();
    }

    public Publisher(String name, String bio) {
        this.name = name;
        this.bio = bio;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
