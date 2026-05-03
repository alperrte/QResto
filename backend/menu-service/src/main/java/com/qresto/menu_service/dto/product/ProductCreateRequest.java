package com.qresto.menu_service.dto.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductCreateRequest {

    @NotNull(message = "Category id is required")
    private Long categoryId;

    private Long subCategoryId;

    @NotBlank(message = "Product name is required")
    @Size(max = 150, message = "Product name can be max 150 characters")
    private String name;

    @Size(max = 1000, message = "Description can be max 1000 characters")
    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
    private BigDecimal price;

    @Size(max = 500, message = "Image URL can be max 500 characters")
    private String imageUrl;

    private Boolean vatIncluded;

    @Size(max = 1500, message = "Ingredients can be max 1500 characters")
    private String ingredients;

    @Size(max = 1500, message = "Removable ingredients can be max 1500 characters")
    private String removableIngredients;

    @Size(max = 1500, message = "Addable ingredients can be max 1500 characters")
    private String addableIngredients;

    private Integer calorie;
    private Integer gram;
    private Integer prepTimeMin;
}
