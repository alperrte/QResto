package com.qresto.qr_service.dto.response;

import com.qresto.qr_service.entity.enums.GuestSessionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GuestSessionResponse {

    private Long id;
    private Long tableSessionId;
    private String guestCode;
    private String deviceToken;
    private GuestSessionStatus status;
    private LocalDateTime joinedAt;
    private LocalDateTime lastActivityAt;
    private LocalDateTime expiredAt;
    private LocalDateTime closedAt;
    private String closeReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}