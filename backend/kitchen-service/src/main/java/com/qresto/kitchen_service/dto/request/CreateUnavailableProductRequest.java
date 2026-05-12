package com.qresto.kitchen_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateUnavailableProductRequest {

    @NotNull(message = "Product id boş olamaz")
    private Long productId;

    @NotBlank(message = "Product name boş olamaz")
    private String productName;

    @NotBlank(message = "Reason boş olamaz")
    private String reason;
}