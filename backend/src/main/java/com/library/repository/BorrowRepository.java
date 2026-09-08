package com.library.repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Borrow;

public interface BorrowRepository extends MongoRepository<Borrow, String> {
    List<Borrow> findByUserIdOrderByRequestDateDesc(String userId);
    List<Borrow> findByUserIdAndStatus(String userId, Borrow.Status status);
    List<Borrow> findByStatus(Borrow.Status status);
    Page<Borrow> findByStatus(Borrow.Status status, Pageable pageable);
    List<Borrow> findByBookIdAndStatus(String bookId, Borrow.Status status);
    long countByBookIdAndStatus(String bookId, Borrow.Status status);
    List<Borrow> findByStatusAndDueDateBefore(Borrow.Status status, LocalDate date);
    long countByStatus(Borrow.Status status);
    long countByUserIdAndStatus(String userId, Borrow.Status status);
    long countByUserId(String userId);
    List<Borrow> findByUserIdAndFineStatus(String userId, Borrow.FineStatus fineStatus);
    List<Borrow> findByFineStatus(Borrow.FineStatus fineStatus);
}
