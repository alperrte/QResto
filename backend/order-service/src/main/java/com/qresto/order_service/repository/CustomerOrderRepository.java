package com.qresto.order_service.repository;

import com.qresto.order_service.entity.CustomerOrder;
import com.qresto.order_service.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

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
}