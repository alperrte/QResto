package com.qresto.qr_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TableQrCodeResponse {


    private Long id;
    private Long tableId;
    private UUID qrUuid;
    private String qrToken;
    private String qrImageUrl;
    private Integer versionNo;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String qrContent;

}