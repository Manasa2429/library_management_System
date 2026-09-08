package com.library.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Member;

public interface MemberRepository extends MongoRepository<Member, String> {}
