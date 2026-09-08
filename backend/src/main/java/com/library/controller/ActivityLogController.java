package com.library.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.ActivityLog;
import com.library.service.ActivityLogService;

@RestController
@RequestMapping("/api/activity-logs")
@PreAuthorize("hasRole('ADMIN')")
public class ActivityLogController {

    @Autowired
    private ActivityLogService activityLogService;

    @GetMapping
    public ResponseEntity<Page<ActivityLog>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<ActivityLog> logs = activityLogService.getLogs(PageRequest.of(page, size));
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ActivityLog>> getRecentLogs() {
        return ResponseEntity.ok(activityLogService.getRecentLogs());
    }
}
