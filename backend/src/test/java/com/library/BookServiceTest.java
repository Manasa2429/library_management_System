package com.library;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.library.exception.BadRequestException;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.repository.AuthorRepository;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.CategoryRepository;
import com.library.repository.PublisherRepository;
import com.library.service.ActivityLogService;
import com.library.service.BookService;

class BookServiceTest {

    @Mock
    private BookRepository bookRepository;

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private PublisherRepository publisherRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BorrowRepository borrowRepository;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private BookService bookService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testUpdateBook_ZeroActiveBorrows_ReconcilesAvailableCopies() {
        Book book = new Book();
        book.setId("book1");
        book.setTitle("1984");
        book.setTotalCopies(1);
        book.setAvailableCopies(1);

        when(bookRepository.findById("book1")).thenReturn(Optional.of(book));
        when(borrowRepository.countByBookIdAndStatus("book1", Borrow.Status.BORROWED)).thenReturn(0L);
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        Book updated = bookService.updateBook(
                "book1", null, null, null, null, null,
                5, null, null, null, null, null, null, null,
                "admin@library.com", "admin1"
        );

        assertNotNull(updated);
        assertEquals(5, updated.getTotalCopies());
        assertEquals(5, updated.getAvailableCopies());
        assertEquals("AVAILABLE", updated.getStatus());
        verify(bookRepository).save(book);
    }

    @Test
    void testUpdateBook_WithActiveBorrows_DeductsFromAvailableCopies() {
        Book book = new Book();
        book.setId("book1");
        book.setTitle("1984");
        book.setTotalCopies(5);
        book.setAvailableCopies(4);

        when(bookRepository.findById("book1")).thenReturn(Optional.of(book));
        when(borrowRepository.countByBookIdAndStatus("book1", Borrow.Status.BORROWED)).thenReturn(1L);
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        Book updated = bookService.updateBook(
                "book1", null, null, null, null, null,
                8, null, null, null, null, null, null, null,
                "admin@library.com", "admin1"
        );

        assertNotNull(updated);
        assertEquals(8, updated.getTotalCopies());
        assertEquals(7, updated.getAvailableCopies(), "Available copies should be 8 - 1 = 7");
        assertEquals("AVAILABLE", updated.getStatus());
    }

    @Test
    void testUpdateBook_TotalCopiesLessThanActiveBorrows_ThrowsBadRequest() {
        Book book = new Book();
        book.setId("book1");
        book.setTitle("1984");
        book.setTotalCopies(5);
        book.setAvailableCopies(2);

        when(bookRepository.findById("book1")).thenReturn(Optional.of(book));
        when(borrowRepository.countByBookIdAndStatus("book1", Borrow.Status.BORROWED)).thenReturn(3L);

        assertThrows(BadRequestException.class, () -> bookService.updateBook(
                "book1", null, null, null, null, null,
                2, null, null, null, null, null, null, null,
                "admin@library.com", "admin1"
        ));
    }

    @Test
    void testGetAllBooks_SelfHealsCorruptedRecordWhereAvailableExceedsTotal() {
        // Book with corrupt state 5 available out of 1 total
        Book book = new Book();
        book.setId("book1");
        book.setTitle("1984");
        book.setTotalCopies(1);
        book.setAvailableCopies(5);

        when(bookRepository.findAll()).thenReturn(List.of(book));
        when(borrowRepository.countByBookIdAndStatus("book1", Borrow.Status.BORROWED)).thenReturn(0L);
        when(bookRepository.save(any(Book.class))).thenAnswer(inv -> inv.getArgument(0));

        List<Book> books = bookService.getAllBooks();

        assertEquals(1, books.size());
        Book healed = books.get(0);
        assertEquals(5, healed.getTotalCopies(), "Total copies should be auto-repaired to match 5");
        assertEquals(5, healed.getAvailableCopies());
    }

    @Test
    void testBookModel_ClampingGuarantees() {
        Book book = new Book();
        // Setting availableCopies to 5 expands totalCopies so available <= total is always preserved
        book.setAvailableCopies(5);
        assertEquals(5, book.getTotalCopies());
        assertEquals(5, book.getAvailableCopies());

        // Now reducing totalCopies to 2 must clamp availableCopies down to 2
        book.setTotalCopies(2);
        assertEquals(2, book.getTotalCopies());
        assertEquals(2, book.getAvailableCopies(), "Reducing totalCopies to 2 must clamp availableCopies down to 2");
    }
}
