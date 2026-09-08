package com.library.repository;

import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.PasswordResetToken;

public interface PasswordResetTokenRepository extends MongoRepository<PasswordResetToken, String> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByEmail(String email);
}
