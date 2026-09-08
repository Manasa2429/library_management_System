package com.library.service;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.library.model.ActivityLog;
import com.library.repository.ActivityLogRepository;

@Service
public class ActivityLogService {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Async
    public void log(String userId, String userEmail, String action, String description) {
        try {
            ActivityLog log = new ActivityLog(userId, userEmail, action, description);
            activityLogRepository.save(log);
        } catch (Exception ignored) {
            // logging should never break the main operation
        }
    }

    public Page<ActivityLog> getLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByTimestampDesc(pageable);
    }

    public List<ActivityLog> getRecentLogs() {
        return activityLogRepository.findTop20ByOrderByTimestampDesc();
    }
}
