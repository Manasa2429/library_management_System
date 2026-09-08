package com.library.controller;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.library.dto.AuthResponse;
import com.library.dto.ChangePasswordRequest;
import com.library.dto.ForgotPasswordRequest;
import com.library.dto.LoginRequest;
import com.library.dto.MessageResponse;
import com.library.dto.ResetPasswordRequest;
import com.library.dto.SignupRequest;
import com.library.dto.UserProfileDto;
import com.library.model.User;
import com.library.repository.UserRepository;
import com.library.security.UserDetailsImpl;
import com.library.service.AuthService;
import com.library.service.EmailService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Value("${spring.mail.host:}")
    private String mailHost;

    @Value("${spring.mail.port:}")
    private String mailPort;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @PostMapping("/register")
    public ResponseEntity<MessageResponse> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        MessageResponse response = authService.register(signUpRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        MessageResponse response = authService.forgotPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        MessageResponse response = authService.resetPassword(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageResponse> changePassword(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        MessageResponse response = authService.changePassword(userDetails.getId(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = authService.getProfile(userDetails.getId());
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @Valid @RequestBody UserProfileDto dto) {
        User user = authService.updateProfile(userDetails.getId(), dto);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/check-mail-config")
    public ResponseEntity<Map<String, Object>> checkMailConfig() {
        Map<String, Object> status = new LinkedHashMap<>();
        boolean isConfigured = mailUsername != null && !mailUsername.trim().isEmpty();
        status.put("mailSenderInitialized", mailSender != null);
        status.put("mailHost", mailHost);
        status.put("mailPort", mailPort);
        status.put("mailUsernameConfigured", isConfigured);
        status.put("mailUsername", isConfigured ? mailUsername : "NOT_CONFIGURED");
        return ResponseEntity.ok(status);
    }

    @GetMapping("/test-mail")
    public ResponseEntity<Map<String, Object>> testMail(@RequestParam String to) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            emailService.sendEmail(to, "Test Email - SmartLibrary", "This is a test email confirming that your Library SMTP setup is working correctly.");
            result.put("success", true);
            result.put("message", "Test email triggered to " + to + ". Check your inbox (and spam folder)!");
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}
