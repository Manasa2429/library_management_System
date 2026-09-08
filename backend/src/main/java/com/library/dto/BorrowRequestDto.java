package com.library.dto;

import jakarta.validation.constraints.NotBlank;

public class BorrowRequestDto {

    @NotBlank(message = "Book ID is required")
    private String bookId;

    private String notes;

    public BorrowRequestDto() {}

    public BorrowRequestDto(String bookId, String notes) {
        this.bookId = bookId;
        this.notes = notes;
    }

    public String getBookId() { return bookId; }
    public void setBookId(String bookId) { this.bookId = bookId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
