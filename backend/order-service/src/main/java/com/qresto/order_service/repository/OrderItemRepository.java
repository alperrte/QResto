package com.qresto.order_service.repository;

import com.qresto.order_service.dto.response.OrderAdminProductSalesAggregateResponse;
import com.qresto.order_service.dto.response.OrderAdminProductYesterdayRevenueRow;
import com.qresto.order_service.dto.response.OrderAdminTopProductResponse;
import com.qresto.order_service.entity.OrderItem;
import com.qresto.order_service.entity.enums.OrderItemStatus;
import com.qresto.order_service.entity.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    List<OrderItem> findByOrderIdAndStatus(Long orderId, OrderItemStatus status);

    List<OrderItem> findByProductId(Long productId);

    @Query("""
            select new com.qresto.order_service.dto.response.OrderAdminTopProductResponse(
                i.productId,
                i.productName,
                sum(i.quantity),
                sum(i.lineTotal),
                max(i.productImageUrl)
            )
            from OrderItem i
            join i.order o
            where o.status in :orderStatuses
              and o.createdAt >= :start
              and o.createdAt < :end
              and i.status = :itemStatus
            group by i.productId, i.productName
            order by sum(i.lineTotal) desc
            """)
    List<OrderAdminTopProductResponse> findTopProductsByRevenue(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("orderStatuses") List<OrderStatus> orderStatuses,
            @Param("itemStatus") OrderItemStatus itemStatus,
            Pageable pageable
    );

    @Query("""
            select new com.qresto.order_service.dto.response.OrderAdminProductSalesAggregateResponse(
                i.productId,
                i.productName,
                sum(i.quantity),
                sum(i.lineTotal),
                count(distinct o.id)
            )
            from OrderItem i
            join i.order o
            where o.status in :orderStatuses
              and o.createdAt >= :start
              and o.createdAt < :end
              and i.status = :itemStatus
            group by i.productId, i.productName
            order by sum(i.lineTotal) desc
            """)
    List<OrderAdminProductSalesAggregateResponse> findProductSalesAggregates(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("orderStatuses") List<OrderStatus> orderStatuses,
            @Param("itemStatus") OrderItemStatus itemStatus,
            Pageable pageable
    );

    @Query("""
            select new com.qresto.order_service.dto.response.OrderAdminProductYesterdayRevenueRow(
                i.productId,
                sum(i.lineTotal)
            )
            from OrderItem i
            join i.order o
            where o.status in :orderStatuses
              and o.createdAt >= :start
              and o.createdAt < :end
              and i.status = :itemStatus
              and i.productId in :productIds
            group by i.productId
            """)
    List<OrderAdminProductYesterdayRevenueRow> findYesterdayRevenueByProductIds(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end,
            @Param("orderStatuses") List<OrderStatus> orderStatuses,
            @Param("itemStatus") OrderItemStatus itemStatus,
            @Param("productIds") List<Long> productIds
    );
}