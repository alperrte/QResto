package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
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