package com.qresto.qr_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QrScanRequest {

    @NotBlank(message = "QR token cannot be blank")
    private String qrToken;

    @NotBlank(message = "Device token cannot be blank")
    private String deviceToken;
}