package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Fine;

public interface FineRepository extends MongoRepository<Fine, String> {
    List<Fine> findByUserId(String userId);
    List<Fine> findByStatus(Fine.Status status);
    Optional<Fine> findByBorrowId(String borrowId);
    long countByStatus(Fine.Status status);
}
