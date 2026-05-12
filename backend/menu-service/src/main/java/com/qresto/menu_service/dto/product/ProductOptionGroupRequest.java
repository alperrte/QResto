package com.qresto.menu_service.dto.product;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductOptionGroupRequest {

    @NotBlank(message = "Option group kind is required")
    @Size(max = 20)
    private String kind;

    private Boolean hasPrice;

    @Size(max = 200)
    private String userTitle;

    @Size(max = 200)
    private String metaTitle;

    @Size(max = 500)
    private String descriptionLine;

    private Boolean required;

    @Min(1)
    @Max(99)
    private Integer maxSelect;

    private Boolean includedInPreview;

    @Valid
    private List<ProductOptionChoiceRequest> choices;
}
