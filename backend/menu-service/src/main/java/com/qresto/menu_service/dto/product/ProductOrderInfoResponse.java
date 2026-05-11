package com.qresto.menu_service.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductOrderInfoResponse {

    private Long id;

    private String name;

    private BigDecimal price;

    private Boolean vatIncluded;

    private Boolean active;

    private Boolean inStock;

    private String ingredients;

    private String removableIngredients;

    private String addableIngredients;

    private Integer prepTimeMin;

    private Long categoryId;

    private Long subCategoryId;
}