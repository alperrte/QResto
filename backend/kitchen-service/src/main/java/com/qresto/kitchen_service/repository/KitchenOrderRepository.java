package com.qresto.kitchen_service.repository;

import com.qresto.kitchen_service.entity.KitchenOrder;
import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface KitchenOrderRepository extends JpaRepository<KitchenOrder, Long> {

    List<KitchenOrder> findByStatus(KitchenOrderStatus status);

    Optional<KitchenOrder> findByOrderId(Long orderId);

}
