package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.dto.PaymentInitiateRequestDto;
import com.library.dto.PaymentProcessRequestDto;
import com.library.dto.PaymentResponseDto;
import com.library.dto.PaymentStatsDto;
import com.library.security.UserDetailsImpl;
import com.library.service.PaymentService;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    private boolean isUserAdmin(UserDetailsImpl userDetails) {
        return userDetails != null && userDetails.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }

    @PostMapping("/initiate/{fineId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponseDto> initiatePayment(
            @PathVariable String fineId,
            @RequestBody(required = false) PaymentInitiateRequestDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = isUserAdmin(userDetails);
        PaymentResponseDto response = paymentService.initiatePayment(
                fineId,
                dto,
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getName(),
                isAdmin
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{paymentId}/process")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponseDto> processPayment(
            @PathVariable String paymentId,
            @RequestBody(required = false) PaymentProcessRequestDto dto,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = isUserAdmin(userDetails);
        PaymentResponseDto response = paymentService.processPayment(
                paymentId,
                dto,
                userDetails.getId(),
                isAdmin
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{paymentId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponseDto> cancelPayment(
            @PathVariable String paymentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = isUserAdmin(userDetails);
        PaymentResponseDto response = paymentService.cancelPayment(paymentId, userDetails.getId(), isAdmin);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PaymentResponseDto>> getMyPayments(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(paymentService.getMyPayments(userDetails.getId()));
    }

    @GetMapping("/{paymentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PaymentResponseDto> getPaymentById(
            @PathVariable String paymentId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = isUserAdmin(userDetails);
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId, userDetails.getId(), isAdmin));
    }

    @GetMapping("/fines/{fineId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PaymentResponseDto>> getPaymentsByFine(
            @PathVariable String fineId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        boolean isAdmin = isUserAdmin(userDetails);
        return ResponseEntity.ok(paymentService.getPaymentsByFineId(fineId, userDetails.getId(), isAdmin));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDto>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PaymentStatsDto> getPaymentStats() {
        return ResponseEntity.ok(paymentService.getPaymentStats());
    }
}
