package com.library.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.repository.BorrowRepository;
import com.library.security.UserDetailsImpl;
import com.library.service.BookService;

@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private com.library.config.DatabaseSeeder databaseSeeder;

    @PostMapping("/seed-samples")
    public ResponseEntity<?> seedSampleBooks() {
        return ResponseEntity.ok(databaseSeeder.seedSampleBooks());
    }

    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam("q") String keyword) {
        return bookService.searchBooks(keyword);
    }

    @GetMapping("/featured")
    public List<Book> getFeaturedBooks() {
        return bookService.getFeaturedBooks();
    }

    @GetMapping("/recent")
    public List<Book> getRecentBooks() {
        return bookService.getRecentBooks();
    }

    @GetMapping("/category/{categoryId}")
    public List<Book> getBooksByCategory(@PathVariable String categoryId) {
        return bookService.getBooksByCategory(categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookById(@PathVariable String id) {
        Book book = bookService.getBookById(id);

        List<Borrow> activeBorrows = borrowRepository.findByBookIdAndStatus(id, Borrow.Status.BORROWED);
        Borrow latestBorrow = activeBorrows.isEmpty() ? null : activeBorrows.get(0);

        Map<String, Object> response = new HashMap<>();
        response.put("id", book.getId());
        response.put("title", book.getTitle());
        response.put("isbn", book.getIsbn());
        response.put("description", book.getDescription());
        response.put("image", book.getImage());
        response.put("shelf", book.getShelf());
        response.put("publicationYear", book.getPublicationYear());
        response.put("totalCopies", book.getTotalCopies());
        response.put("availableCopies", book.getAvailableCopies());
        response.put("featured", book.isFeatured());
        response.put("author", book.getAuthor());
        response.put("publisher", book.getPublisher());
        response.put("category", book.getCategory());
        response.put("authorName", book.getAuthorName());
        response.put("publisherName", book.getPublisherName());
        response.put("categoryName", book.getCategoryName());
        response.put("authorId", book.getAuthorId());
        response.put("publisherId", book.getPublisherId());
        response.put("categoryId", book.getCategoryId());
        response.put("status", book.getAvailableCopies() > 0 ? "AVAILABLE" : "OUT_OF_STOCK");
        response.put("borrowedBy", latestBorrow != null ? latestBorrow.getUserName() : null);

        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addBook(
            @RequestParam String title,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String shelf,
            @RequestParam(required = false) Integer publicationYear,
            @RequestParam(required = false) Integer totalCopies,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String authorId,
            @RequestParam(required = false) String publisherId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {

        Book book = bookService.addBook(
                title, isbn, description, shelf, publicationYear, totalCopies,
                featured, authorId, publisherId, categoryId, image,
                adminDetails.getEmail(), adminDetails.getId()
        );
        return ResponseEntity.ok(book);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateBook(
            @PathVariable String id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String isbn,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String shelf,
            @RequestParam(required = false) Integer publicationYear,
            @RequestParam(required = false) Integer totalCopies,
            @RequestParam(required = false) Integer availableCopies,
            @RequestParam(required = false) Boolean featured,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String authorId,
            @RequestParam(required = false) String publisherId,
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) MultipartFile image,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {

        Book updated = bookService.updateBook(
                id, title, isbn, description, shelf, publicationYear, totalCopies,
                availableCopies, featured, status, authorId, publisherId, categoryId,
                image, adminDetails.getEmail(), adminDetails.getId()
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteBook(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        bookService.deleteBook(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(Map.of("message", "Book deleted successfully!"));
    }
}
