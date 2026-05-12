package com.qresto.order_service.repository;

import com.qresto.order_service.entity.CustomerOrder;
import com.qresto.order_service.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {

    Optional<CustomerOrder> findByOrderNo(String orderNo);

    boolean existsByOrderNo(String orderNo);

    List<CustomerOrder> findByTableSessionId(Long tableSessionId);

    List<CustomerOrder> findByTableSessionIdAndStatus(Long tableSessionId, OrderStatus status);

    List<CustomerOrder> findByTableSessionIdAndStatusIn(Long tableSessionId, List<OrderStatus> statuses);

    List<CustomerOrder> findByGuestSessionId(Long guestSessionId);

    List<CustomerOrder> findByStatus(OrderStatus status);

    List<CustomerOrder> findByStatusIn(List<OrderStatus> statuses);
    List<CustomerOrder> findByStatusInOrderByCreatedAtDesc(List<OrderStatus> statuses);

    List<CustomerOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<CustomerOrder> findByStatusInAndCreatedAtBetween(
            List<OrderStatus> statuses,
            LocalDateTime start,
            LocalDateTime end
    );

    Long countByStatusIn(List<OrderStatus> statuses);

    Long countByStatus(OrderStatus status);
}