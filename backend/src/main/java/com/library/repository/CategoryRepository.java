package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {
    List<Category> findByNameContainingIgnoreCase(String name);
    Optional<Category> findByNameIgnoreCase(String name);
}