package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Author;

public interface AuthorRepository extends MongoRepository<Author, String> {
    List<Author> findByNameContainingIgnoreCase(String name);
    Optional<Author> findByNameIgnoreCase(String name);
}
