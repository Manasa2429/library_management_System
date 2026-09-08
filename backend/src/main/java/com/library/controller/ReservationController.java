package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.Reservation;
import com.library.security.UserDetailsImpl;
import com.library.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    @PostMapping("/join")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Reservation> joinWaitlist(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam String bookId) {
        Reservation reservation = reservationService.joinWaitlist(userDetails.getId(), bookId);
        return ResponseEntity.ok(reservation);
    }

    @DeleteMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> cancelReservation(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        reservationService.cancelReservation(id, userDetails.getId());
        return ResponseEntity.ok("Reservation cancelled successfully");
    }

    @GetMapping("/my-reservations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Reservation>> getMyReservations(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(reservationService.getUserReservations(userDetails.getId()));
    }

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }
}
