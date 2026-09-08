package com.library.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.User;
import com.library.security.UserDetailsImpl;
import com.library.service.UserService;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersWithStats());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserDetails(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserDetailsWithHistory(id));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<User> toggleUserStatus(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        User updated = userService.toggleUserStatus(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        userService.deleteUser(id, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }
}
