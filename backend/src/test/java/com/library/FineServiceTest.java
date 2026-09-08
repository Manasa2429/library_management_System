package com.library;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import com.library.model.Borrow;
import com.library.model.Fine;
import com.library.repository.BorrowRepository;
import com.library.repository.FineRepository;
import com.library.service.ActivityLogService;
import com.library.service.FineService;
import com.library.service.NotificationService;

class FineServiceTest {

    @Mock
    private FineRepository fineRepository;

    @Mock
    private BorrowRepository borrowRepository;

    @Mock
    private ActivityLogService activityLogService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private FineService fineService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateOrUpdateFine_Calculation() {
        long overdueDays = 5;
        double fineAmount = 50.0; // 5 days * 10/day

        when(fineRepository.findByBorrowId("borrow1")).thenReturn(Optional.empty());
        when(fineRepository.save(any(Fine.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Fine fine = fineService.createOrUpdateFine(
                "borrow1", "user1", "John Doe", "john@example.com",
                "book1", "Clean Code", overdueDays, fineAmount
        );

        assertNotNull(fine);
        assertEquals(5, fine.getOverdueDays());
        assertEquals(50.0, fine.getFineAmount());
        assertEquals(Fine.Status.UNPAID, fine.getStatus());
    }

    @Test
    void testMarkFineAsPaid() {
        Fine fine = new Fine("borrow1", "user1", "John", "john@example.com", "book1", "Clean Code", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.UNPAID);

        Borrow borrow = new Borrow();
        borrow.setId("borrow1");

        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));
        when(fineRepository.save(any(Fine.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(borrowRepository.findById("borrow1")).thenReturn(Optional.of(borrow));

        Fine paid = fineService.markFineAsPaid("fine1", "admin@library.com", "admin1");

        assertEquals(Fine.Status.PAID, paid.getStatus());
        verify(fineRepository).save(paid);
    }
}
