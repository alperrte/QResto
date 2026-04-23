package com.qresto.qr_service.repository;

import com.qresto.qr_service.entity.RestaurantTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {

    Optional<RestaurantTable> findByTableNo(Integer tableNo);

    boolean existsByTableNo(Integer tableNo);

}