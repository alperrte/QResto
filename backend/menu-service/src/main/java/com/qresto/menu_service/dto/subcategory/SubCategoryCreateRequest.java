package com.qresto.menu_service.dto.subcategory;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SubCategoryCreateRequest {

    @NotNull(message = "Category id is required")
    private Long categoryId;

    @NotBlank(message = "Sub category name is required")
    @Size(max = 100, message = "Sub category name can be max 100 characters")
    private String name;
}
