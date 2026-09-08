package com.library;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class LibraryApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(LibraryApplication.class, args);
    }

    /**
     * Loads variables from .env file into System properties so Spring Boot can access them securely.
     * Looks in the current working directory, backend/, and the parent directory.
     */
    private static void loadDotenv() {
        String[] potentialPaths = { ".env", "backend/.env", "../.env" };
        for (String path : potentialPaths) {
            File envFile = new File(path);
            if (envFile.exists() && envFile.isFile()) {
                try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIndex = line.indexOf('=');
                        if (eqIndex > 0) {
                            String key = line.substring(0, eqIndex).trim();
                            String value = line.substring(eqIndex + 1).trim();

                            // Strip surrounding single or double quotes
                            if ((value.startsWith("\"") && value.endsWith("\"")) ||
                                (value.startsWith("'") && value.endsWith("'"))) {
                                if (value.length() >= 2) {
                                    value = value.substring(1, value.length() - 1);
                                }
                            }

                            // Ignore empty values so Spring Boot defaults can apply
                            if (value.isEmpty()) {
                                continue;
                            }

                            // Set system property if not already set by JVM or environment
                            if (System.getProperty(key) == null && System.getenv(key) == null) {
                                System.setProperty(key, value);
                            }

                            // Map MONGODB_URI directly to Spring Data MongoDB property if valid
                            if ("MONGODB_URI".equals(key)) {
                                if (value.startsWith("mongodb://") || value.startsWith("mongodb+srv://")) {
                                    System.setProperty("spring.data.mongodb.uri", value);
                                }
                            }

                            // Map Mail & Client environment variables
                            if ("MAIL_USERNAME".equals(key)) {
                                System.setProperty("spring.mail.username", value);
                            }
                            if ("MAIL_PASSWORD".equals(key)) {
                                // Automatically trim spaces if copied from Google App Password (e.g. 'abcd efgh ijkl mnop')
                                String sanitizedPassword = value.replace(" ", "");
                                System.setProperty("spring.mail.password", sanitizedPassword);
                                System.setProperty("MAIL_PASSWORD", sanitizedPassword);
                            }
                            if ("MAIL_HOST".equals(key)) {
                                System.setProperty("spring.mail.host", value);
                            }
                            if ("MAIL_PORT".equals(key)) {
                                System.setProperty("spring.mail.port", value);
                            }
                            if ("CLIENT_URL".equals(key)) {
                                System.setProperty("app.client.url", value);
                            }
                        }
                    }
                    System.out.println(">>> [Security] Loaded environment variables securely from: " + envFile.getAbsolutePath());
                    return;
                } catch (Exception e) {
                    System.err.println(">>> [Security] Failed to read .env file at " + path + ": " + e.getMessage());
                }
            }
        }
    }
}
