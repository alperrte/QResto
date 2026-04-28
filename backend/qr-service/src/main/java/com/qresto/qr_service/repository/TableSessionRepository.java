package com.qresto.qr_service.repository;

import com.qresto.qr_service.entity.TableSession;
import com.qresto.qr_service.entity.enums.TableSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableSessionRepository extends JpaRepository<TableSession, Long> {

    Optional<TableSession> findBySessionCode(String sessionCode);

    List<TableSession> findByRestaurantTableId(Long tableId);

    Optional<TableSession> findByRestaurantTableIdAndStatus(Long tableId, TableSessionStatus status);

    List<TableSession> findByRestaurantTableIdAndStatusIn(Long tableId, List<TableSessionStatus> statuses);

}