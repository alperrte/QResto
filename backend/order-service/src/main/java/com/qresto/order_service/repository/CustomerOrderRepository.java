package com.qresto.order_service.repository;

import com.qresto.order_service.dto.response.OrderAdminTableHeatmapAggregateResponse;
import com.qresto.order_service.entity.CustomerOrder;
import com.qresto.order_service.entity.enums.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("""
            select new com.qresto.order_service.dto.response.OrderAdminTableHeatmapAggregateResponse(
                o.tableId,
                o.tableName,
                count(o.id)
            )
            from CustomerOrder o
            where o.status in :orderStatuses
              and o.createdAt >= :start
              and o.createdAt < :end
            group by o.tableId, o.tableName
            order by count(o.id) desc
            """)
    List<OrderAdminTableHeatmapAggregateResponse> findTableHeatmapAggregates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("orderStatuses") List<OrderStatus> orderStatuses
    );
}