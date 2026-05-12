package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class GuestSessionResponse {

    private Long id;

    private Long tableSessionId;

    private String guestCode;

    private String deviceToken;

    private String status;

    private LocalDateTime joinedAt;

    private LocalDateTime lastActivityAt;

    private LocalDateTime expiredAt;

    private LocalDateTime closedAt;

    private String closeReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}