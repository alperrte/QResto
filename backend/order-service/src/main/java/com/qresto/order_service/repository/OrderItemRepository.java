package com.qresto.order_service.repository;

import com.qresto.order_service.entity.OrderItem;
import com.qresto.order_service.entity.enums.OrderItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByOrderIdAndStatus(Long orderId, OrderItemStatus status);

    List<OrderItem> findByProductId(Long productId);
}