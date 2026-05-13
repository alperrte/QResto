package com.qresto.kitchen_service.dto.response;

import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class KitchenOrderResponse {

    private Long orderId;

    private Long tableId;

    private Integer tableNumber;

    private String orderNumber;

    private KitchenOrderStatus status;

    private BigDecimal totalAmount;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}