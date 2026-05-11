package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class KitchenOrderResponse {

    private Long orderId;

    private Long tableId;

    private Integer tableNumber;

    private String orderNumber;

    private String status;

    private BigDecimal totalAmount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}