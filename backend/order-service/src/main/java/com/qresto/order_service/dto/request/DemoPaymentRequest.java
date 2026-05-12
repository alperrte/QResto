package com.qresto.order_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DemoPaymentRequest {

    @NotNull(message = "Guest session id boş olamaz")
    private Long guestSessionId;
}