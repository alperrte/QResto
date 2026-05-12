package com.qresto.menu_service.dto.product;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductOptionGroupResponse {
    private Long id;
    private Integer sortOrder;
    private String kind;
    private Boolean hasPrice;
    private String userTitle;
    private String metaTitle;
    private String descriptionLine;
    private Boolean required;
    private Integer maxSelect;
    private Boolean includedInPreview;
    private List<ProductOptionChoiceResponse> choices;
}
