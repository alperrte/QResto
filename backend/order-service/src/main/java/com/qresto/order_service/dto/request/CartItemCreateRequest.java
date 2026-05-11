package com.qresto.order_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemCreateRequest {

    @NotNull
    private Long productId;

    @NotNull
    private String productName;

    @NotNull
    @Positive
    private BigDecimal productPrice;

    @NotNull
    private Boolean vatIncluded;

    @NotNull
    @Positive
    private Integer quantity;

    private String removedIngredients;
    private String addedIngredients;
    private String note;
}