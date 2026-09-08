package com.library.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "books")
public class Book {

    @Id
    private String id;

    private String title;
    private String isbn;
    private String description;

    private String authorId;
    private String authorName;

    private String publisherId;
    private String publisherName;

    private String categoryId;
    private String categoryName;

    private String shelf;
    private String image;
    private Integer publicationYear;

    private int totalCopies = 1;
    private int availableCopies = 1;
    private boolean featured = false;
    private String status = "AVAILABLE"; // AVAILABLE, OUT_OF_STOCK, ARCHIVED

    @CreatedDate
    private LocalDateTime createdAt = LocalDateTime.now();

    @LastModifiedDate
    private LocalDateTime updatedAt = LocalDateTime.now();

    public Book() {}

    public Book(String title, String authorName, String publisherName, String categoryName, String shelf, String description, String image) {
        this.title = title;
        this.authorName = authorName;
        this.publisherName = publisherName;
        this.categoryName = categoryName;
        this.shelf = shelf;
        this.description = description;
        this.image = image;
        this.totalCopies = 1;
        this.availableCopies = 1;
        this.status = "AVAILABLE";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getIsbn() { return isbn; }
    public void setIsbn(String isbn) { this.isbn = isbn; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getPublisherId() { return publisherId; }
    public void setPublisherId(String publisherId) { this.publisherId = publisherId; }

    public String getPublisherName() { return publisherName; }
    public void setPublisherName(String publisherName) { this.publisherName = publisherName; }

    public String getCategoryId() { return categoryId; }
    public void setCategoryId(String categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getShelf() { return shelf; }
    public void setShelf(String shelf) { this.shelf = shelf; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Integer getPublicationYear() { return publicationYear; }
    public void setPublicationYear(Integer publicationYear) { this.publicationYear = publicationYear; }

    public int getTotalCopies() { return totalCopies; }
    public void setTotalCopies(int totalCopies) { 
        this.totalCopies = Math.max(0, totalCopies); 
        if (this.availableCopies > this.totalCopies) {
            this.availableCopies = this.totalCopies;
        }
        this.status = this.availableCopies > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
    }

    public int getAvailableCopies() { return availableCopies; }
    public void setAvailableCopies(int availableCopies) { 
        int validAvailable = Math.max(0, availableCopies);
        if (validAvailable > this.totalCopies) {
            this.totalCopies = validAvailable;
        }
        this.availableCopies = validAvailable;
        this.status = this.availableCopies > 0 ? "AVAILABLE" : "OUT_OF_STOCK";
    }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Helpers for backward compatibility with existing controllers/frontend
    public Author getAuthor() {
        if (authorName == null && authorId == null) return null;
        Author a = new Author();
        a.setId(authorId);
        a.setName(authorName);
        return a;
    }

    public void setAuthor(Author author) {
        if (author != null) {
            this.authorId = author.getId();
            this.authorName = author.getName();
        } else {
            this.authorId = null;
            this.authorName = null;
        }
    }

    public Category getCategory() {
        if (categoryName == null && categoryId == null) return null;
        Category c = new Category();
        c.setId(categoryId);
        c.setName(categoryName);
        return c;
    }

    public void setCategory(Category category) {
        if (category != null) {
            this.categoryId = category.getId();
            this.categoryName = category.getName();
        } else {
            this.categoryId = null;
            this.categoryName = null;
        }
    }

    public Publisher getPublisher() {
        if (publisherName == null && publisherId == null) return null;
        Publisher p = new Publisher();
        p.setId(publisherId);
        p.setName(publisherName);
        return p;
    }

    public void setPublisher(Publisher publisher) {
        if (publisher != null) {
            this.publisherId = publisher.getId();
            this.publisherName = publisher.getName();
        } else {
            this.publisherId = null;
            this.publisherName = null;
        }
    }
}
