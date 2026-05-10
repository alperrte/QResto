package com.qresto.order_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class CartResponse {

    private Long id;
    private Long tableSessionId;
    private Long guestSessionId;
    private Long tableId;
    private String tableName;
    private String status;
    private BigDecimal subtotalAmount;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<CartItemResponse> items;
    private LocalDateTime orderedAt;
    private LocalDateTime clearedAt;
}