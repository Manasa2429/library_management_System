package com.library.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.School;

public interface SchoolRepository extends MongoRepository<School, String> {}
