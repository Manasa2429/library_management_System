package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.library.dto.BorrowRequestDto;
import com.library.model.Borrow;
import com.library.security.UserDetailsImpl;
import com.library.service.BorrowService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    @Autowired
    private BorrowService borrowService;

    // Backward-compatible listing: Returns all borrows
    @GetMapping
    public List<Borrow> getAllBorrowRecords() {
        return borrowService.getAllBorrows();
    }

    // User endpoints
    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Borrow> requestBorrow(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody BorrowRequestDto dto) {
        Borrow borrow = borrowService.requestBorrow(userDetails.getId(), dto);
        return ResponseEntity.ok(borrow);
    }

    // Backward-compatible borrow submission
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Borrow> legacyCreateBorrow(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody BorrowRequestDto dto) {
        Borrow borrow = borrowService.requestBorrow(userDetails.getId(), dto);
        return ResponseEntity.ok(borrow);
    }

    @PutMapping("/{id}/return")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Borrow> returnBook(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Borrow borrow = borrowService.returnBook(id, userDetails.getEmail(), userDetails.getId());
        return ResponseEntity.ok(borrow);
    }

    @GetMapping("/my-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Borrow>> getMyRequests(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(borrowService.getMyRequests(userDetails.getId()));
    }

    @GetMapping("/my-active")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Borrow>> getMyActiveBorrows(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(borrowService.getMyActiveBorrows(userDetails.getId()));
    }

    @GetMapping("/my-history")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Borrow>> getMyBorrowHistory(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(borrowService.getMyBorrowHistory(userDetails.getId()));
    }

    // Admin endpoints
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Borrow> approveBorrow(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        Borrow approved = borrowService.approveBorrow(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(approved);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Borrow> rejectBorrow(
            @PathVariable String id,
            @RequestParam(required = false) String reason,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        Borrow rejected = borrowService.rejectBorrow(id, reason, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(rejected);
    }

    @GetMapping("/admin/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Borrow>> getAdminPendingRequests() {
        return ResponseEntity.ok(borrowService.getPendingRequests());
    }

    @GetMapping("/admin/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Borrow>> getAdminActiveBorrows() {
        return ResponseEntity.ok(borrowService.getActiveBorrows());
    }

    @GetMapping("/admin/overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Borrow>> getAdminOverdueBorrows() {
        return ResponseEntity.ok(borrowService.getOverdueBorrows());
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Borrow>> getAdminAllBorrows() {
        return ResponseEntity.ok(borrowService.getAllBorrows());
    }
}
