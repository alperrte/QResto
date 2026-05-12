package com.qresto.kitchen_service.repository;

import com.qresto.kitchen_service.entity.KitchenCancelLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KitchenCancelLogRepository extends JpaRepository<KitchenCancelLog, Long> {
}