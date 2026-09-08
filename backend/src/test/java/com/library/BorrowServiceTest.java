package com.library;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.library.dto.BorrowRequestDto;
import com.library.exception.BadRequestException;
import com.library.model.Book;
import com.library.model.Borrow;
import com.library.model.SystemSetting;
import com.library.model.User;
import com.library.repository.BookRepository;
import com.library.repository.BorrowRepository;
import com.library.repository.UserRepository;
import com.library.service.ActivityLogService;
import com.library.service.BorrowService;
import com.library.service.EmailService;
import com.library.service.FineService;
import com.library.service.NotificationService;
import com.library.service.ReservationService;
import com.library.service.SystemSettingService;

class BorrowServiceTest {

    @Mock
    private BorrowRepository borrowRepository;

    @Mock
    private BookRepository bookRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SystemSettingService systemSettingService;

    @Mock
    private FineService fineService;

    @Mock
    private ReservationService reservationService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private EmailService emailService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private BorrowService borrowService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRequestBorrow_Success() {
        User user = new User("John", "john@example.com", "123", "pass", User.Role.ROLE_USER);
        user.setId("u1");

        Book book = new Book();
        book.setId("b1");
        book.setTitle("Clean Code");
        book.setAvailableCopies(2);

        SystemSetting settings = new SystemSetting();
        settings.setMaxBooksPerUser(5);

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(bookRepository.findById("b1")).thenReturn(Optional.of(book));
        when(systemSettingService.getSettings()).thenReturn(settings);
        when(borrowRepository.countByUserIdAndStatus("u1", Borrow.Status.BORROWED)).thenReturn(0L);
        when(borrowRepository.countByUserIdAndStatus("u1", Borrow.Status.APPROVED)).thenReturn(0L);
        when(borrowRepository.countByUserIdAndStatus("u1", Borrow.Status.PENDING)).thenReturn(0L);
        when(borrowRepository.findByBookIdAndStatus("b1", Borrow.Status.PENDING)).thenReturn(Collections.emptyList());
        when(borrowRepository.findByBookIdAndStatus("b1", Borrow.Status.BORROWED)).thenReturn(Collections.emptyList());
        when(borrowRepository.save(any(Borrow.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BorrowRequestDto dto = new BorrowRequestDto("b1", "Reading for work");
        Borrow borrow = borrowService.requestBorrow("u1", dto);

        assertNotNull(borrow);
        assertEquals(Borrow.Status.PENDING, borrow.getStatus());
        assertEquals("Clean Code", borrow.getBookTitle());
    }

    @Test
    void testRequestBorrow_OutOfStock_ThrowsBadRequest() {
        User user = new User("John", "john@example.com", "123", "pass", User.Role.ROLE_USER);
        user.setId("u1");

        Book book = new Book();
        book.setId("b1");
        book.setTitle("Clean Code");
        book.setAvailableCopies(0); // No copies available

        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(bookRepository.findById("b1")).thenReturn(Optional.of(book));

        BorrowRequestDto dto = new BorrowRequestDto("b1", null);

        assertThrows(BadRequestException.class, () -> borrowService.requestBorrow("u1", dto));
    }

    @Test
    void testApproveBorrow_DecrementsCopies() {
        Borrow borrow = new Borrow("u1", "John", "john@example.com", "b1", "Clean Code", null);
        borrow.setId("borrow1");
        borrow.setStatus(Borrow.Status.PENDING);

        Book book = new Book();
        book.setId("b1");
        book.setTitle("Clean Code");
        book.setAvailableCopies(3);

        SystemSetting settings = new SystemSetting();
        settings.setBorrowDurationDays(14);

        when(borrowRepository.findById("borrow1")).thenReturn(Optional.of(borrow));
        when(bookRepository.findById("b1")).thenReturn(Optional.of(book));
        when(systemSettingService.getSettings()).thenReturn(settings);
        when(borrowRepository.save(any(Borrow.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Borrow approved = borrowService.approveBorrow("borrow1", "admin@library.com", "admin1");

        assertEquals(Borrow.Status.BORROWED, approved.getStatus());
        assertEquals(2, book.getAvailableCopies()); // Decremented from 3 to 2
        verify(bookRepository).save(book);
    }
}
