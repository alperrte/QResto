package com.qresto.qr_service.repository;

import com.qresto.qr_service.entity.TableQrCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TableQrCodeRepository extends JpaRepository<TableQrCode, Long> {

    List<TableQrCode> findByRestaurantTableId(Long tableId);

    Optional<TableQrCode> findByQrToken(String qrToken);

    Optional<TableQrCode> findByQrUuid(UUID qrUuid);

    Optional<TableQrCode> findByRestaurantTableIdAndActiveTrue(Long tableId);

    Optional<TableQrCode> findFirstByRestaurantTableIdOrderByVersionNoDesc(Long tableId);

    void deleteByRestaurantTableId(Long tableId);
}