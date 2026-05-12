package com.qresto.menu_service.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private Long categoryId;
    private Long subCategoryId;
    private String name;
    private String description;
    private BigDecimal price;
    private String imageUrl;
    private Boolean vatIncluded;
    private String ingredients;
    private String removableIngredients;
    private String addableIngredients;
    private Integer calorie;
    private Integer gram;
    private Integer prepTimeMin;
    private BigDecimal avgRating;
    private Boolean active;
    private Boolean inStock;

    private Boolean orderNoteEnabled;
    private String orderNoteTitle;

    private List<ProductOptionGroupResponse> optionGroups;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
