package com.library.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendEmail(String to, String subject, String content) {
        if (mailSender == null) {
            logger.error(">>> [MAIL ERROR] JavaMailSender is null. Spring Boot mail bean was not created. Check spring.mail.host setting.");
            return;
        }

        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            logger.warn(">>> [MAIL SIMULATION] No spring.mail.username configured. Simulated email to: {} | Subject: {}", to, subject);
            return;
        }

        try {
            logger.info(">>> [MAIL] Sending email from '{}' to '{}' with subject '{}'...", fromEmail, to, subject);
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);
            mailSender.send(message);
            logger.info(">>> [MAIL SUCCESS] Email sent successfully to {}", to);
        } catch (Exception e) {
            logger.error(">>> [MAIL FAILED] Failed to send email to {}: {}. Root cause: {}", to, e.getMessage(), (e.getCause() != null ? e.getCause().getMessage() : "none"), e);
        }
    }
}
