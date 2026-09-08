package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Favorite;

public interface FavoriteRepository extends MongoRepository<Favorite, String> {
    List<Favorite> findByUserId(String userId);
    Optional<Favorite> findByUserIdAndBookId(String userId, String bookId);
    void deleteByUserIdAndBookId(String userId, String bookId);
    boolean existsByUserIdAndBookId(String userId, String bookId);
}
