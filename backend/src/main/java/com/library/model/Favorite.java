package com.library.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "favorites")
@CompoundIndex(name = "user_book_idx", def = "{'userId': 1, 'bookId': 1}", unique = true)
public class Favorite {

    @Id
    private String id;

    private String userId;
    private String bookId;

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    public Favorite() {}

    public Favorite(String userId, String bookId) {
        this.userId = userId;
        this.bookId = bookId;
        this.createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
