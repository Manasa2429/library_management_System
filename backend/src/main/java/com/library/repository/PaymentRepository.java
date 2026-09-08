package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Payment;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Payment> findByFineId(String fineId);
    Optional<Payment> findByFineIdAndStatus(String fineId, Payment.Status status);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findAllByOrderByCreatedAtDesc();
    long countByStatus(Payment.Status status);
    List<Payment> findByStatus(Payment.Status status);
}
