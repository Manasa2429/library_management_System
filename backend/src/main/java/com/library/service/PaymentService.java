package com.library.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.dto.PaymentInitiateRequestDto;
import com.library.dto.PaymentProcessRequestDto;
import com.library.dto.PaymentResponseDto;
import com.library.dto.PaymentStatsDto;
import com.library.exception.BadRequestException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.Borrow;
import com.library.model.Fine;
import com.library.model.Payment;
import com.library.model.PaymentMethod;
import com.library.repository.BorrowRepository;
import com.library.repository.FineRepository;
import com.library.repository.PaymentRepository;
import com.library.service.gateway.PaymentGateway;
import com.library.service.gateway.PaymentGatewayRequest;
import com.library.service.gateway.PaymentGatewayResponse;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private FineRepository fineRepository;

    @Autowired
    private BorrowRepository borrowRepository;

    @Autowired
    private PaymentGateway paymentGateway;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ActivityLogService activityLogService;

    public PaymentResponseDto initiatePayment(String fineId, PaymentInitiateRequestDto dto,
                                              String userId, String userEmail, String userName, boolean isAdmin) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with ID: " + fineId));

        if (!isAdmin && !fine.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You can only initiate payments for your own fines.");
        }

        if (fine.getStatus() == Fine.Status.PAID) {
            throw new BadRequestException("This fine of ₹" + fine.getFineAmount() + " has already been paid.");
        }

        if (fine.getStatus() == Fine.Status.WAIVED) {
            throw new BadRequestException("This fine has been waived and requires no payment.");
        }

        // Prevent duplicate successful payments
        if (paymentRepository.findByFineIdAndStatus(fineId, Payment.Status.SUCCESS).isPresent()) {
            throw new BadRequestException("A successful payment transaction already exists for this fine.");
        }

        PaymentMethod method = (dto != null && dto.getPaymentMethod() != null)
                ? dto.getPaymentMethod()
                : PaymentMethod.UPI;

        // Generate authoritative, unique transaction ID: LIBPAY-yyyyMMdd-XXXXXX
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 6).toUpperCase();
        String transactionId = "LIBPAY-" + datePart + "-" + randomPart;

        Payment payment = new Payment(
                fine.getId(),
                fine.getBorrowId(),
                fine.getUserId(),
                fine.getUserName(),
                fine.getUserEmail(),
                fine.getBookId(),
                fine.getBookTitle(),
                fine.getFineAmount(),
                method,
                transactionId
        );

        if (dto != null && dto.getNotes() != null) {
            payment.setNotes(dto.getNotes());
        }

        Payment saved = paymentRepository.save(payment);

        activityLogService.log(
                userId,
                userEmail,
                "PAYMENT_INITIATED",
                "Initiated simulated online payment of ₹" + payment.getAmount() + " for fine ID: " + fine.getId() + " (Tx: " + transactionId + ")"
        );

        return PaymentResponseDto.fromEntity(saved);
    }

    public PaymentResponseDto processPayment(String paymentId, PaymentProcessRequestDto dto,
                                             String userId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + paymentId));

        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You can only process your own payment transactions.");
        }

        if (payment.getStatus() == Payment.Status.SUCCESS) {
            throw new BadRequestException("This payment has already been successfully processed.");
        }

        if (payment.getStatus() == Payment.Status.CANCELLED) {
            throw new BadRequestException("This payment was cancelled. Please initiate a new payment checkout.");
        }

        // Verify fine status
        Fine fine = fineRepository.findById(payment.getFineId())
                .orElseThrow(() -> new ResourceNotFoundException("Fine record not found for this payment."));

        if (fine.getStatus() == Fine.Status.PAID) {
            throw new BadRequestException("This fine has already been marked as PAID.");
        }

        // Prepare simulated gateway request
        PaymentGatewayRequest gwRequest = new PaymentGatewayRequest(
                payment.getTransactionId(),
                payment.getAmount(),
                payment.getPaymentMethod(),
                payment.getUserEmail(),
                payment.getUserName(),
                dto != null ? dto.getSimulateOutcome() : null
        );

        PaymentGatewayResponse gwResponse = paymentGateway.processPayment(gwRequest);

        if (gwResponse.isSuccess()) {
            payment.setStatus(Payment.Status.SUCCESS);
            payment.setPaidAt(LocalDateTime.now());
            payment.setNotes("Gateway Ref: " + gwResponse.getGatewayReference());
            Payment saved = paymentRepository.save(payment);

            // Mark Fine as PAID
            fine.setStatus(Fine.Status.PAID);
            fine.setSettledAt(LocalDateTime.now());
            fineRepository.save(fine);

            // Update corresponding Borrow record if present
            if (fine.getBorrowId() != null) {
                borrowRepository.findById(fine.getBorrowId()).ifPresent(b -> {
                    b.setFineStatus(Borrow.FineStatus.PAID);
                    borrowRepository.save(b);
                });
            }

            notificationService.createNotification(
                    payment.getUserId(),
                    "Online Fine Payment Received",
                    "Your payment of ₹" + payment.getAmount() + " for '" + payment.getBookTitle() + "' was successful! (Transaction ID: " + payment.getTransactionId() + ")",
                    "PAYMENT_SUCCESS"
            );

            activityLogService.log(
                    userId,
                    payment.getUserEmail(),
                    "PAYMENT_SUCCESS",
                    "Successfully completed online payment of ₹" + payment.getAmount() + " for '" + payment.getBookTitle() + "' via " + payment.getPaymentMethod() + " (Tx: " + payment.getTransactionId() + ")"
            );

            return PaymentResponseDto.fromEntity(saved);
        } else {
            payment.setStatus(Payment.Status.FAILED);
            payment.setFailureReason(gwResponse.getMessage() != null ? gwResponse.getMessage() : "Simulated demo payment failed.");
            Payment saved = paymentRepository.save(payment);

            // Note: Fine remains UNPAID

            notificationService.createNotification(
                    payment.getUserId(),
                    "Online Payment Failed",
                    "Your payment of ₹" + payment.getAmount() + " for '" + payment.getBookTitle() + "' could not be completed. (" + payment.getFailureReason() + ")",
                    "PAYMENT_FAILED"
            );

            activityLogService.log(
                    userId,
                    payment.getUserEmail(),
                    "PAYMENT_FAILED",
                    "Online payment of ₹" + payment.getAmount() + " failed for '" + payment.getBookTitle() + "': " + payment.getFailureReason()
            );

            return PaymentResponseDto.fromEntity(saved);
        }
    }

    public PaymentResponseDto cancelPayment(String paymentId, String userId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + paymentId));

        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: You cannot cancel another user's payment.");
        }

        if (payment.getStatus() == Payment.Status.SUCCESS) {
            throw new BadRequestException("Cannot cancel a payment that has already succeeded.");
        }

        payment.setStatus(Payment.Status.CANCELLED);
        Payment saved = paymentRepository.save(payment);

        activityLogService.log(
                userId,
                payment.getUserEmail(),
                "PAYMENT_CANCELLED",
                "Simulated payment cancelled for transaction: " + payment.getTransactionId()
        );

        return PaymentResponseDto.fromEntity(saved);
    }

    public PaymentResponseDto getPaymentById(String paymentId, String userId, boolean isAdmin) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + paymentId));

        if (!isAdmin && !payment.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: Access denied to this payment record.");
        }

        return PaymentResponseDto.fromEntity(payment);
    }

    public List<PaymentResponseDto> getMyPayments(String userId) {
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(PaymentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDto> getPaymentsByFineId(String fineId, String userId, boolean isAdmin) {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new ResourceNotFoundException("Fine not found with ID: " + fineId));

        if (!isAdmin && !fine.getUserId().equals(userId)) {
            throw new BadRequestException("Unauthorized: Access denied.");
        }

        return paymentRepository.findByFineId(fineId).stream()
                .map(PaymentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDto> getAllPayments() {
        return paymentRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(PaymentResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public PaymentStatsDto getPaymentStats() {
        PaymentStatsDto stats = new PaymentStatsDto();
        List<Payment> all = paymentRepository.findAll();

        stats.setTotalTransactions(all.size());

        double totalCollected = all.stream()
                .filter(p -> p.getStatus() == Payment.Status.SUCCESS)
                .mapToDouble(Payment::getAmount)
                .sum();
        stats.setTotalCollected(totalCollected);

        long success = all.stream().filter(p -> p.getStatus() == Payment.Status.SUCCESS).count();
        long pending = all.stream().filter(p -> p.getStatus() == Payment.Status.INITIATED || p.getStatus() == Payment.Status.PROCESSING).count();
        long failed = all.stream().filter(p -> p.getStatus() == Payment.Status.FAILED).count();
        long cancelled = all.stream().filter(p -> p.getStatus() == Payment.Status.CANCELLED).count();

        stats.setSuccessfulCount(success);
        stats.setPendingCount(pending);
        stats.setFailedCount(failed);
        stats.setCancelledCount(cancelled);

        // Payment method distribution for SUCCESS payments
        Map<String, Long> methodDist = new HashMap<>();
        for (Payment p : all) {
            if (p.getStatus() == Payment.Status.SUCCESS && p.getPaymentMethod() != null) {
                String key = p.getPaymentMethod().name();
                methodDist.put(key, methodDist.getOrDefault(key, 0L) + 1L);
            }
        }
        stats.setMethodDistribution(methodDist);

        // Monthly collection
        Map<String, Double> monthly = new HashMap<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (Payment p : all) {
            if (p.getStatus() == Payment.Status.SUCCESS && p.getPaidAt() != null) {
                String mKey = p.getPaidAt().format(monthFmt);
                monthly.put(mKey, monthly.getOrDefault(mKey, 0.0) + p.getAmount());
            }
        }
        stats.setMonthlyCollection(monthly);

        return stats;
    }
}
