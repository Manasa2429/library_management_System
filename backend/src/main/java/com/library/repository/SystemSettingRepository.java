package com.library.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.library.model.SystemSetting;

public interface SystemSettingRepository extends MongoRepository<SystemSetting, String> {}
