package com.library.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Publisher;

public interface PublisherRepository extends MongoRepository<Publisher, String> {
    List<Publisher> findByNameContainingIgnoreCase(String name);
    Optional<Publisher> findByNameIgnoreCase(String name);
}
