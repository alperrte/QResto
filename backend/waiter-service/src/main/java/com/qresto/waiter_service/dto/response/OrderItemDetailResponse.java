package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class OrderItemDetailResponse {

    private Long id;

    private Long productId;

    private String productName;

    private BigDecimal productPrice;

    private Boolean vatIncluded;

    private Integer quantity;

    private String removedIngredients;

    private String addedIngredients;

    private String note;

    private BigDecimal lineTotal;

    private String status;

    private String cancelReason;

    private LocalDateTime cancelledAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}