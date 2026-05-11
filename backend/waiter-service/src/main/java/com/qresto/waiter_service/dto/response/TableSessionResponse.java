package com.qresto.waiter_service.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TableSessionResponse {

    private Long id;
    private Long tableId;
    private Long qrCodeId;
    private String sessionCode;
    private String status;
    private LocalDateTime startedAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime closedAt;
    private String closeReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}