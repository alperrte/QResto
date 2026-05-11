package com.qresto.order_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CartItemResponse {

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
}