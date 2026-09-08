package com.library.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Author;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.model.Category;
import com.library.model.Publisher;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.PublisherRepository;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private PublisherRepository publisherRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private ActivityLogService activityLogService;

    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads";

    public Book reconcileStock(Book book) {
        if (book == null || book.getId() == null) return book;
        long activeBorrows = borrowRepository.countByBookIdAndStatus(book.getId(), Borrow.Status.BORROWED);
        boolean changed = false;

        // If totalCopies is less than availableCopies, the total was corrupted or incorrectly lowered
        if (book.getTotalCopies() < book.getAvailableCopies()) {
            book.setTotalCopies(Math.max(book.getTotalCopies(), book.getAvailableCopies() + (int) activeBorrows));
            changed = true;
        }

        int expectedAvailable = (int) Math.max(0, book.getTotalCopies() - activeBorrows);
        if (book.getAvailableCopies() != expectedAvailable) {
            book.setAvailableCopies(expectedAvailable);
            changed = true;
        }

        if (changed) {
            return bookRepository.save(book);
        }
        return book;
    }

    public List<Book> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        List<Book> result = new java.util.ArrayList<>(books.size());
        for (Book b : books) {
            result.add(reconcileStock(b));
        }
        return result;
    }

    public List<Book> searchBooks(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllBooks();
        }
        List<Book> books = bookRepository.searchBooks(keyword.trim());
        List<Book> result = new java.util.ArrayList<>(books.size());
        for (Book b : books) {
            result.add(reconcileStock(b));
        }
        return result;
    }

    public Book getBookById(String id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ID: " + id));
        return reconcileStock(book);
    }

    public List<Book> getFeaturedBooks() {
        return bookRepository.findByFeaturedTrue();
    }

    public List<Book> getRecentBooks() {
        return bookRepository.findTop10ByOrderByCreatedAtDesc();
    }

    public List<Book> getBooksByCategory(String categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public Book addBook(String title, String isbn, String description, String shelf,
                        Integer publicationYear, Integer totalCopies, Boolean featured,
                        String authorId, String publisherId, String categoryId,
                        MultipartFile image, String adminEmail, String adminId) {
        Book book = new Book();
        book.setTitle(title);
        book.setIsbn(isbn);
        book.setDescription(description);
        book.setShelf(shelf);
        book.setPublicationYear(publicationYear);

        int copies = (totalCopies != null && totalCopies > 0) ? totalCopies : 1;
        book.setTotalCopies(copies);
        book.setAvailableCopies(copies);
        book.setFeatured(featured != null ? featured : false);
        book.setStatus("AVAILABLE");
        book.setCreatedAt(LocalDateTime.now());
        book.setUpdatedAt(LocalDateTime.now());

        assignRelations(book, authorId, publisherId, categoryId);
        handleImageUpload(book, image);

        Book saved = bookRepository.save(book);
        activityLogService.log(adminId, adminEmail, "BOOK_ADDED", "Added new book: '" + saved.getTitle() + "'");
        return saved;
    }

    public Book updateBook(String id, String title, String isbn, String description, String shelf,
                           Integer publicationYear, Integer totalCopies, Integer availableCopies,
                           Boolean featured, String status, String authorId, String publisherId,
                           String categoryId, MultipartFile image, String adminEmail, String adminId) {
        Book book = getBookById(id);

        if (title != null) book.setTitle(title);
        if (isbn != null) book.setIsbn(isbn);
        if (description != null) book.setDescription(description);
        if (shelf != null) book.setShelf(shelf);
        if (publicationYear != null) book.setPublicationYear(publicationYear);

        long activeBorrows = borrowRepository.countByBookIdAndStatus(id, Borrow.Status.BORROWED);

        if (totalCopies != null && totalCopies >= 0) {
            if (totalCopies < activeBorrows) {
                throw new BadRequestException("Cannot set total copies to " + totalCopies + 
                    " because " + activeBorrows + " copy/copies are currently borrowed by users.");
            }
            book.setTotalCopies(totalCopies);

            if (availableCopies != null && availableCopies >= 0) {
                int maxAvailable = (int) Math.max(0, totalCopies - activeBorrows);
                book.setAvailableCopies(Math.min(availableCopies, maxAvailable));
            } else {
                book.setAvailableCopies((int) Math.max(0, totalCopies - activeBorrows));
            }
        } else if (availableCopies != null && availableCopies >= 0) {
            int maxAvailable = (int) Math.max(0, book.getTotalCopies() - activeBorrows);
            book.setAvailableCopies(Math.min(availableCopies, maxAvailable));
        }
        if (featured != null) book.setFeatured(featured);
        if (status != null) book.setStatus(status);

        assignRelations(book, authorId, publisherId, categoryId);
        handleImageUpload(book, image);
        book.setUpdatedAt(LocalDateTime.now());

        Book updated = bookRepository.save(book);
        activityLogService.log(adminId, adminEmail, "BOOK_UPDATED", "Updated book: '" + updated.getTitle() + "'");
        return updated;
    }

    public void deleteBook(String id, String adminEmail, String adminId) {
        Book book = getBookById(id);
        bookRepository.deleteById(id);
        activityLogService.log(adminId, adminEmail, "BOOK_DELETED", "Deleted book: '" + book.getTitle() + "'");
    }

    private void assignRelations(Book book, String authorId, String publisherId, String categoryId) {
        if (authorId != null && !authorId.trim().isEmpty()) {
            authorRepository.findById(authorId).ifPresent(a -> {
                book.setAuthorId(a.getId());
                book.setAuthorName(a.getName());
            });
        }
        if (publisherId != null && !publisherId.trim().isEmpty()) {
            publisherRepository.findById(publisherId).ifPresent(p -> {
                book.setPublisherId(p.getId());
                book.setPublisherName(p.getName());
            });
        }
        if (categoryId != null && !categoryId.trim().isEmpty()) {
            categoryRepository.findById(categoryId).ifPresent(c -> {
                book.setCategoryId(c.getId());
                book.setCategoryName(c.getName());
            });
        }
    }

    private void handleImageUpload(Book book, MultipartFile image) {
        if (image != null && !image.isEmpty()) {
            try {
                Path uploadPath = Paths.get(UPLOAD_DIR);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                String cleanOriginalName = image.getOriginalFilename() != null
                        ? image.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_")
                        : "cover.jpg";
                String fileName = System.currentTimeMillis() + "_" + cleanOriginalName;
                Path filePath = uploadPath.resolve(fileName);
                Files.write(filePath, image.getBytes());
                book.setImage("/uploads/" + fileName);
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload book cover image", e);
            }
        }
    }
}
