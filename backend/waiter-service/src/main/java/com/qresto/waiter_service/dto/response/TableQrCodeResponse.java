package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
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