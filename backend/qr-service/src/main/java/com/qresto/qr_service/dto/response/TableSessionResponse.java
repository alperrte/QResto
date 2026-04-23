package com.qresto.qr_service.dto.response;

import com.qresto.qr_service.entity.enums.TableSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TableSessionResponse {

    private Long id;
    private Long tableId;
    private Long qrCodeId;
    private String sessionCode;
    private TableSessionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime closedAt;
    private String closeReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}