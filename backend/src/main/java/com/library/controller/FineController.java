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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.Fine;
import com.library.security.UserDetailsImpl;
import com.library.service.FineService;

@RestController
@RequestMapping("/api/fines")
public class FineController {

    @Autowired
    private FineService fineService;

    @GetMapping("/my-fines")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Fine>> getMyFines(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(fineService.getFinesByUserId(userDetails.getId()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fine>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }

    @GetMapping("/admin/unpaid")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fine>> getUnpaidFines() {
        return ResponseEntity.ok(fineService.getUnpaidFines());
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fine> markFineAsPaid(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        Fine paid = fineService.markFineAsPaid(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(paid);
    }

    @PutMapping("/{id}/waive")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Fine> waiveFine(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        Fine waived = fineService.waiveFine(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(waived);
    }

    @PostMapping("/generate-demo")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Fine> generateDemoFineForUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        Fine fine = fineService.generateDemoFineForUser(userDetails.getId());
        return ResponseEntity.ok(fine);
    }

    @PostMapping("/admin/generate-demo")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Fine>> generateDemoFinesForAll() {
        List<Fine> fines = fineService.generateDemoFinesForAllUsers();
        return ResponseEntity.ok(fines);
    }
}
