package com.library;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import com.library.dto.PaymentInitiateRequestDto;
import com.library.dto.PaymentProcessRequestDto;
import com.library.dto.PaymentResponseDto;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Borrow;
import com.library.model.Fine;
import com.library.model.Payment;
import com.library.model.PaymentMethod;
import com.library.repository.BorrowRepository;
import com.library.repository.FineRepository;
import com.library.repository.PaymentRepository;
import com.library.service.ActivityLogService;
import com.library.service.NotificationService;
import com.library.service.PaymentService;
import com.library.service.gateway.MockPaymentGateway;

class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private FineRepository fineRepository;

    @Mock
    private BorrowRepository borrowRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private PaymentService paymentService;

    private MockPaymentGateway mockGateway;

    @BeforeEach
    void setUp() throws Exception {
        MockitoAnnotations.openMocks(this);
        mockGateway = new MockPaymentGateway();

        // Inject real MockPaymentGateway into PaymentService via reflection or field
        var gatewayField = PaymentService.class.getDeclaredField("paymentGateway");
        gatewayField.setAccessible(true);
        gatewayField.set(paymentService, mockGateway);
    }

    @Test
    void testInitiatePayment_Success() {
        Fine fine = new Fine("b1", "u1", "Rahul", "rahul@example.com", "book1", "Think Fast and Slow", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.UNPAID);

        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));
        when(paymentRepository.findByFineIdAndStatus("fine1", Payment.Status.SUCCESS)).thenReturn(Optional.empty());
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId("pay1");
            return p;
        });

        PaymentInitiateRequestDto dto = new PaymentInitiateRequestDto(PaymentMethod.UPI);
        PaymentResponseDto response = paymentService.initiatePayment("fine1", dto, "u1", "rahul@example.com", "Rahul", false);

        assertNotNull(response);
        assertEquals("fine1", response.getFineId());
        assertEquals("u1", response.getUserId());
        assertEquals(30.0, response.getAmount());
        assertEquals(PaymentMethod.UPI, response.getPaymentMethod());
        assertEquals(Payment.Status.INITIATED, response.getStatus());
        assertTrue(response.getTransactionId().startsWith("LIBPAY-"));
    }

    @Test
    void testInitiatePayment_FineAlreadyPaid_ThrowsBadRequest() {
        Fine fine = new Fine("b1", "u1", "Rahul", "rahul@example.com", "book1", "Think Fast and Slow", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.PAID);

        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));

        PaymentInitiateRequestDto dto = new PaymentInitiateRequestDto(PaymentMethod.UPI);
        assertThrows(BadRequestException.class, () ->
                paymentService.initiatePayment("fine1", dto, "u1", "rahul@example.com", "Rahul", false));
    }

    @Test
    void testInitiatePayment_UnauthorizedUser_ThrowsBadRequest() {
        Fine fine = new Fine("b1", "u1", "Rahul", "rahul@example.com", "book1", "Think Fast and Slow", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.UNPAID);

        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));

        PaymentInitiateRequestDto dto = new PaymentInitiateRequestDto(PaymentMethod.UPI);
        // Another user 'u2' tries to pay
        assertThrows(BadRequestException.class, () ->
                paymentService.initiatePayment("fine1", dto, "u2", "other@example.com", "Other", false));
    }

    @Test
    void testInitiatePayment_InvalidFine_ThrowsResourceNotFound() {
        when(fineRepository.findById("nonexistent")).thenReturn(Optional.empty());

        PaymentInitiateRequestDto dto = new PaymentInitiateRequestDto(PaymentMethod.UPI);
        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.initiatePayment("nonexistent", dto, "u1", "rahul@example.com", "Rahul", false));
    }

    @Test
    void testInitiatePayment_DuplicateSuccessfulPayment_ThrowsBadRequest() {
        Fine fine = new Fine("b1", "u1", "Rahul", "rahul@example.com", "book1", "Think Fast and Slow", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.UNPAID);

        Payment priorPayment = new Payment("fine1", "b1", "u1", "Rahul", "rahul@example.com",
                "book1", "Think Fast and Slow", 30.0, PaymentMethod.UPI, "LIBPAY-20260907-OLD123");
        priorPayment.setStatus(Payment.Status.SUCCESS);

        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));
        when(paymentRepository.findByFineIdAndStatus("fine1", Payment.Status.SUCCESS)).thenReturn(Optional.of(priorPayment));

        PaymentInitiateRequestDto dto = new PaymentInitiateRequestDto(PaymentMethod.UPI);
        assertThrows(BadRequestException.class, () ->
                paymentService.initiatePayment("fine1", dto, "u1", "rahul@example.com", "Rahul", false));
    }

    @Test
    void testProcessPayment_Success_MarksFineAsPaid() {
        Fine fine = new Fine("b1", "u1", "Rahul", "rahul@example.com", "book1", "Think Fast and Slow", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.UNPAID);

        Borrow borrow = new Borrow();
        borrow.setId("b1");
        borrow.setFineStatus(Borrow.FineStatus.UNPAID);

        Payment payment = new Payment("fine1", "b1", "u1", "Rahul", "rahul@example.com",
                "book1", "Think Fast and Slow", 30.0, PaymentMethod.UPI, "LIBPAY-20260907-NEW123");
        payment.setId("pay1");
        payment.setStatus(Payment.Status.INITIATED);

        when(paymentRepository.findById("pay1")).thenReturn(Optional.of(payment));
        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));
        when(borrowRepository.findById("b1")).thenReturn(Optional.of(borrow));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentProcessRequestDto processDto = new PaymentProcessRequestDto("SUCCESS");
        PaymentResponseDto result = paymentService.processPayment("pay1", processDto, "u1", false);

        assertNotNull(result);
        assertEquals(Payment.Status.SUCCESS, result.getStatus());
        assertEquals(Fine.Status.PAID, fine.getStatus());
        assertEquals(Borrow.FineStatus.PAID, borrow.getFineStatus());

        verify(fineRepository).save(fine);
        verify(borrowRepository).save(borrow);
        verify(paymentRepository).save(payment);
    }

    @Test
    void testProcessPayment_FailureSimulation_KeepsFineUnpaid() {
        Fine fine = new Fine("b1", "u1", "Rahul", "rahul@example.com", "book1", "Think Fast and Slow", 3, 30.0);
        fine.setId("fine1");
        fine.setStatus(Fine.Status.UNPAID);

        Payment payment = new Payment("fine1", "b1", "u1", "Rahul", "rahul@example.com",
                "book1", "Think Fast and Slow", 30.0, PaymentMethod.CREDIT_CARD, "LIBPAY-20260907-FAIL12");
        payment.setId("pay2");
        payment.setStatus(Payment.Status.INITIATED);

        when(paymentRepository.findById("pay2")).thenReturn(Optional.of(payment));
        when(fineRepository.findById("fine1")).thenReturn(Optional.of(fine));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentProcessRequestDto processDto = new PaymentProcessRequestDto("FAILED");
        PaymentResponseDto result = paymentService.processPayment("pay2", processDto, "u1", false);

        assertNotNull(result);
        assertEquals(Payment.Status.FAILED, result.getStatus());
        assertEquals(Fine.Status.UNPAID, fine.getStatus()); // Fine MUST remain UNPAID
        assertNotNull(result.getFailureReason());
    }

    @Test
    void testCancelPayment_Success() {
        Payment payment = new Payment("fine1", "b1", "u1", "Rahul", "rahul@example.com",
                "book1", "Think Fast and Slow", 30.0, PaymentMethod.UPI, "LIBPAY-20260907-CAN123");
        payment.setId("pay3");
        payment.setStatus(Payment.Status.INITIATED);

        when(paymentRepository.findById("pay3")).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponseDto result = paymentService.cancelPayment("pay3", "u1", false);

        assertNotNull(result);
        assertEquals(Payment.Status.CANCELLED, result.getStatus());
    }
}
