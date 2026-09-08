package com.library;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.library.dto.ForgotPasswordRequest;
import com.library.dto.MessageResponse;
import com.library.dto.SignupRequest;
import com.library.exception.BadRequestException;
import com.library.exception.ConflictException;
import com.library.model.PasswordResetToken;
import com.library.model.User;
import com.library.repository.PasswordResetTokenRepository;
import com.library.repository.UserRepository;
import com.library.security.JwtUtils;
import com.library.service.ActivityLogService;
import com.library.service.AuthService;
import com.library.service.EmailService;
import com.library.service.NotificationService;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private ActivityLogService activityLogService;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testRegisterUser_Success() {
        SignupRequest request = new SignupRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPhone("1234567890");
        request.setPassword("Secret123");
        request.setConfirmPassword("Secret123");

        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123")).thenReturn("hashedPassword");

        User savedUser = new User("John Doe", "john@example.com", "1234567890", "hashedPassword", User.Role.ROLE_USER);
        savedUser.setId("user123");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        MessageResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("User registered successfully! Please login to continue.", response.getMessage());
        assertEquals(User.Role.ROLE_USER, savedUser.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterUser_PasswordMismatch_ThrowsBadRequest() {
        SignupRequest request = new SignupRequest();
        request.setName("John Doe");
        request.setEmail("john@example.com");
        request.setPhone("1234567890");
        request.setPassword("Secret123");
        request.setConfirmPassword("DifferentSecret");

        assertThrows(BadRequestException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterUser_DuplicateEmail_ThrowsConflict() {
        SignupRequest request = new SignupRequest();
        request.setName("John Doe");
        request.setEmail("existing@example.com");
        request.setPhone("1234567890");
        request.setPassword("Secret123");
        request.setConfirmPassword("Secret123");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
    }

    @Test
    void testRegisterUser_OnlyEmailAndPassword_DefaultsNameAndPhone_Success() {
        SignupRequest request = new SignupRequest();
        request.setEmail("reader@example.com");
        request.setPassword("Secret123");

        when(userRepository.existsByEmail("reader@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Secret123")).thenReturn("hashedPassword");

        User savedUser = new User("reader", "reader@example.com", "N/A", "hashedPassword", User.Role.ROLE_USER);
        savedUser.setId("user456");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        MessageResponse response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testRegisterUser_AdminEmail_AssignsRoleAdmin() {
        SignupRequest request = new SignupRequest();
        request.setEmail("divyasreemuppuri@gmail.com");
        request.setPassword("admin@123");

        when(userRepository.existsByEmail("divyasreemuppuri@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("admin@123")).thenReturn("hashedPassword");

        User savedUser = new User("divyasreemuppuri", "divyasreemuppuri@gmail.com", "N/A", "hashedPassword", User.Role.ROLE_ADMIN);
        savedUser.setId("admin123");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        MessageResponse response = authService.register(request);

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testForgotPassword_UserExists_DispatchesEmailAndNotification() {
        User user = new User("John Doe", "john@example.com", "1234567890", "hashedPassword", User.Role.ROLE_USER);
        user.setId("user123");

        when(userRepository.findByEmail("john@example.com")).thenReturn(Optional.of(user));

        MessageResponse response = authService.forgotPassword(new ForgotPasswordRequest("john@example.com"));

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(passwordResetTokenRepository).deleteByEmail("john@example.com");
        verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendEmail(eq("john@example.com"), eq("Password Reset Request - SmartLibrary"), anyString());
        verify(notificationService).createNotification(eq("user123"), anyString(), anyString(), eq("SYSTEM"));
    }

    @Test
    void testForgotPassword_UserNotFound_DoesNotDispatchEmail() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        MessageResponse response = authService.forgotPassword(new ForgotPasswordRequest("nonexistent@example.com"));

        assertNotNull(response);
        assertTrue(response.isSuccess());
        verify(passwordResetTokenRepository, never()).deleteByEmail(anyString());
        verify(passwordResetTokenRepository, never()).save(any(PasswordResetToken.class));
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString());
    }
}
