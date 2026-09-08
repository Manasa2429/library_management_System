package com.library.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.library.model.SystemSetting;
import com.library.repository.SystemSettingRepository;

@Service
public class SystemSettingService {

    @Autowired
    private SystemSettingRepository systemSettingRepository;

    @Autowired
    private ActivityLogService activityLogService;

    public SystemSetting getSettings() {
        return systemSettingRepository.findById("SYSTEM_SETTINGS").orElseGet(() -> {
            SystemSetting s = new SystemSetting();
            s.setId("SYSTEM_SETTINGS");
            return systemSettingRepository.save(s);
        });
    }

    public SystemSetting updateSettings(SystemSetting update, String adminEmail, String adminId) {
        SystemSetting current = getSettings();
        if (update.getFinePerDay() >= 0) {
            current.setFinePerDay(update.getFinePerDay());
        }
        if (update.getBorrowDurationDays() > 0) {
            current.setBorrowDurationDays(update.getBorrowDurationDays());
        }
        if (update.getReservationExpiryDays() > 0) {
            current.setReservationExpiryDays(update.getReservationExpiryDays());
        }
        if (update.getMaxBooksPerUser() > 0) {
            current.setMaxBooksPerUser(update.getMaxBooksPerUser());
        }
        SystemSetting saved = systemSettingRepository.save(current);
        activityLogService.log(adminId, adminEmail, "SETTINGS_UPDATED", "System settings updated");
        return saved;
    }
}
