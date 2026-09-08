package com.library.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import com.library.model.BorrowRecord;

public interface BorrowRecordRepository extends MongoRepository<BorrowRecord, String> {
    @Query(value = "{ 'book.id': ?0, 'status': 'BORROWED' }", sort = "{ 'borrowDate': -1 }")
    BorrowRecord findFirstByBookIdOrderByBorrowDateDesc(String bookId);
}
