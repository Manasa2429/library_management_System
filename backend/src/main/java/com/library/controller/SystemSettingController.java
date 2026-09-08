package com.library.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.library.model.SystemSetting;
import com.library.security.UserDetailsImpl;
import com.library.service.SystemSettingService;

@RestController
@RequestMapping("/api/settings")
public class SystemSettingController {

    @Autowired
    private SystemSettingService systemSettingService;

    @GetMapping
    public ResponseEntity<SystemSetting> getSettings() {
        return ResponseEntity.ok(systemSettingService.getSettings());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemSetting> updateSettings(
            @RequestBody SystemSetting update,
            @AuthenticationPrincipal UserDetailsImpl adminDetails) {
        SystemSetting saved = systemSettingService.updateSettings(update, adminDetails.getEmail(), adminDetails.getId());
        return ResponseEntity.ok(saved);
    }
}
