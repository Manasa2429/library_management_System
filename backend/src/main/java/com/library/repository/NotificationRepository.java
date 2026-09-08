package com.library.repository;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.Notification;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    long countByUserIdAndReadFalse(String userId);
}
