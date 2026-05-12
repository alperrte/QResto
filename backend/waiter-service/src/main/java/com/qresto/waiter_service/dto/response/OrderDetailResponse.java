package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderDetailResponse {

    private Long id;

    private String orderNo;

    private Long cartId;

    private Long tableSessionId;

    private Long guestSessionId;

    private Long tableId;

    private String tableName;

    private String status;

    private BigDecimal subtotalAmount;

    private BigDecimal vatAmount;

    private BigDecimal totalAmount;

    private String cancelReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime receivedAt;

    private LocalDateTime preparingAt;

    private LocalDateTime readyAt;

    private LocalDateTime servedAt;

    private LocalDateTime completedAt;

    private LocalDateTime paymentPendingAt;

    private LocalDateTime paidAt;

    private LocalDateTime cancelledAt;

    private List<OrderItemDetailResponse> items;
}