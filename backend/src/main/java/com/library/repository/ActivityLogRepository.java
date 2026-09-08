package com.library.repository;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.ActivityLog;

public interface ActivityLogRepository extends MongoRepository<ActivityLog, String> {
    Page<ActivityLog> findAllByOrderByTimestampDesc(Pageable pageable);
    List<ActivityLog> findTop20ByOrderByTimestampDesc();
    List<ActivityLog> findByUserIdOrderByTimestampDesc(String userId);
    List<ActivityLog> findByActionOrderByTimestampDesc(String action);
}
