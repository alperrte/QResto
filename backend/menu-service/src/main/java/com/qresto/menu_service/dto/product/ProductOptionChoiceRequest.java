package com.qresto.menu_service.dto.product;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class ProductOptionChoiceRequest {

    @Size(max = 200, message = "Option label can be max 200 characters")
    private String label;

    private BigDecimal priceDelta;
}
