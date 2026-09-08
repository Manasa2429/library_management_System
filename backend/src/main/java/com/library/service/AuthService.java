package com.library.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.library.dto.AuthResponse;
import com.library.dto.ChangePasswordRequest;
import com.library.dto.ForgotPasswordRequest;
import com.library.dto.LoginRequest;
import com.library.dto.MessageResponse;
import com.library.dto.ResetPasswordRequest;
import com.library.dto.SignupRequest;
import com.library.dto.UserProfileDto;
import com.library.exception.BadRequestException;
import com.library.exception.ConflictException;
import com.library.exception.ResourceNotFoundException;
import com.library.model.PasswordResetToken;
import com.library.model.User;
import com.library.repository.PasswordResetTokenRepository;
import com.library.repository.UserRepository;
import com.library.security.JwtUtils;
import com.library.security.UserDetailsImpl;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private ActivityLogService activityLogService;

    @Value("${app.client.url:http://localhost:3000}")
    private String clientUrl;

    public MessageResponse register(SignupRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (request.getConfirmPassword() != null && !request.getConfirmPassword().isBlank()
                && !request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirmation password do not match");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already registered. Please login or use a different email.");
        }

        String name = request.getName();
        if (name == null || name.isBlank()) {
            name = email.split("@")[0];
        } else {
            name = name.trim();
        }

        String phone = request.getPhone();
        if (phone == null || phone.isBlank()) {
            phone = "N/A";
        } else {
            phone = phone.trim();
        }

        // Assign ROLE_ADMIN if email matches designated admin, otherwise default to ROLE_USER
        User.Role role = "divyasreemuppuri@gmail.com".equalsIgnoreCase(email)
                ? User.Role.ROLE_ADMIN
                : User.Role.ROLE_USER;

        User user = new User(
                name,
                email,
                phone,
                passwordEncoder.encode(request.getPassword()),
                role
        );

        User savedUser = userRepository.save(user);

        // Send welcome email & notification
        emailService.sendEmail(
                savedUser.getEmail(),
                "Welcome to SmartLibrary!",
                "Hello " + savedUser.getName() + ",\n\nYour library account has been successfully created. You can now explore books, borrow titles, and manage your reading journey.\n\nHappy reading!"
        );

        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to SmartLibrary",
                "Your account was created successfully. Start by exploring our book collection!",
                "SYSTEM"
        );

        activityLogService.log(savedUser.getId(), savedUser.getEmail(), "USER_REGISTERED", "New user registered with email " + savedUser.getEmail() + " as " + role);

        return new MessageResponse(true, "User registered successfully! Please login to continue.");
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(Object::toString)
                .orElse("ROLE_USER");

        activityLogService.log(userDetails.getId(), userDetails.getEmail(), "USER_LOGIN", "User logged in successfully");

        return new AuthResponse(
                jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                userDetails.getPhone(),
                role
        );
    }

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.warn(">>> [AUTH] Password reset requested for unregistered email: '{}'. No email will be sent.", email);
            return new MessageResponse(true, "If that email is registered in our system, you will receive password reset instructions.");
        }

        User user = userOpt.get();
        logger.info(">>> [AUTH] Found registered user: '{}' (Name: '{}'). Generating reset token and dispatching email...", user.getEmail(), user.getName());
        passwordResetTokenRepository.deleteByEmail(email);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(
                token,
                email,
                LocalDateTime.now().plusHours(1)
        );
        passwordResetTokenRepository.save(resetToken);

        String baseUrl = (clientUrl != null && !clientUrl.isBlank()) ? clientUrl.replaceAll("/+$", "") : "http://localhost:3000";
        String resetLink = baseUrl + "/reset-password?token=" + token;
        emailService.sendEmail(
                email,
                "Password Reset Request - SmartLibrary",
                "Hello " + user.getName() + ",\n\nYou recently requested to reset your password for your Library account. Use the following token to reset your password:\n\nToken: " + token + "\n\nOr click here: " + resetLink + "\n\nThis token will expire in 1 hour. If you did not request a password reset, please ignore this email."
        );

        notificationService.createNotification(
                user.getId(),
                "Password Reset Initiated",
                "A password reset request was initiated for your account.",
                "SYSTEM"
        );

        // Always return generic message to avoid email enumeration
        return new MessageResponse(true, "If that email is registered in our system, you will receive password reset instructions.");
    }

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid password reset token"));

        if (resetToken.isExpired()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new BadRequestException("Password reset token has expired. Please request a new one.");
        }

        User user = userRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User associated with this token was not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        emailService.sendEmail(
                user.getEmail(),
                "Password Reset Successful",
                "Hello " + user.getName() + ",\n\nYour password for SmartLibrary has been successfully reset. If this was not you, please contact support immediately."
        );

        notificationService.createNotification(
                user.getId(),
                "Password Reset Successful",
                "Your password has been changed successfully.",
                "SYSTEM"
        );

        activityLogService.log(user.getId(), user.getEmail(), "PASSWORD_RESET", "Password was reset using a reset token");

        return new MessageResponse(true, "Password has been successfully reset. You can now login with your new password.");
    }

    public MessageResponse changePassword(String userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Password Changed",
                "Your account password was updated successfully.",
                "SYSTEM"
        );

        activityLogService.log(user.getId(), user.getEmail(), "PASSWORD_CHANGED", "User changed account password");

        return new MessageResponse(true, "Password updated successfully");
    }

    public User getProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public User updateProfile(String userId, UserProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setName(dto.getName().trim());
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone().trim());
        }
        user.setUpdatedAt(LocalDateTime.now());
        User updated = userRepository.save(user);

        activityLogService.log(user.getId(), user.getEmail(), "PROFILE_UPDATED", "User updated profile information");
        return updated;
    }
}
