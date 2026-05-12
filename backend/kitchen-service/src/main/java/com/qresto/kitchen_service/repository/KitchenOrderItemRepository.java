package com.qresto.kitchen_service.repository;

import com.qresto.kitchen_service.entity.KitchenOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface KitchenOrderItemRepository extends JpaRepository<KitchenOrderItem, Long> {

    List<KitchenOrderItem> findByKitchenOrderId(Long kitchenOrderId);

}