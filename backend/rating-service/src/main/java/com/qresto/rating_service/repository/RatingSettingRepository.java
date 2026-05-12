package com.qresto.rating_service.repository;

import com.qresto.rating_service.entity.RatingSetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RatingSettingRepository extends JpaRepository<RatingSetting, Long> {
}