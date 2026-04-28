package com.qresto.qr_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CloseGuestSessionRequest {

    @NotBlank(message = "Close reason cannot be blank")
    private String closeReason;
}