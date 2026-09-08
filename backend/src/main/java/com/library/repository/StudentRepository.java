package com.library.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Student;

public interface StudentRepository extends MongoRepository<Student, String> {}
