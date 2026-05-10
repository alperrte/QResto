package com.qresto.order_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderCancelRequest {

    @NotBlank(message = "Cancel reason is required")
    private String cancelReason;
}