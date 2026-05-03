package com.qresto.qr_service.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRestaurantTableRequest {

    @NotNull(message = "Table number cannot be null")
    private Integer tableNo;

    @NotBlank(message = "Table name cannot be blank")
    private String name;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;
}