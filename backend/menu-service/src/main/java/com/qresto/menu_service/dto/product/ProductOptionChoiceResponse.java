package com.qresto.menu_service.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductOptionChoiceResponse {
    private Long id;
    private Integer sortOrder;
    private String label;
    private BigDecimal priceDelta;
}
