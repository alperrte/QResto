package com.qresto.qr_service.service;

import com.qresto.qr_service.dto.response.GuestSessionResponse;
import com.qresto.qr_service.entity.GuestSession;
import com.qresto.qr_service.entity.TableSession;
import com.qresto.qr_service.entity.enums.GuestSessionStatus;
import com.qresto.qr_service.repository.GuestSessionRepository;
import com.qresto.qr_service.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuestSessionService {

    private final GuestSessionRepository guestSessionRepository;
    private final TableSessionRepository tableSessionRepository;

    public GuestSessionResponse createGuestSession(Long tableSessionId, String deviceToken) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        LocalDateTime now = LocalDateTime.now();

        GuestSession existingGuestSession = guestSessionRepository
                .findByTableSessionIdAndDeviceToken(tableSessionId, deviceToken)
                .orElse(null);

        if (existingGuestSession != null) {
            existingGuestSession.setStatus(GuestSessionStatus.ACTIVE);
            existingGuestSession.setLastActivityAt(now);

            if (existingGuestSession.getExpiredAt() != null) {
                existingGuestSession.setExpiredAt(null);
            }

            if (existingGuestSession.getClosedAt() != null) {
                existingGuestSession.setClosedAt(null);
            }

            if (existingGuestSession.getCloseReason() != null) {
                existingGuestSession.setCloseReason(null);
            }

            GuestSession updatedGuestSession = guestSessionRepository.save(existingGuestSession);

            tableSession.setLastActivityAt(now);
            tableSessionRepository.save(tableSession);

            return mapToResponse(updatedGuestSession);
        }

        GuestSession guestSession = GuestSession.builder()
                .tableSession(tableSession)
                .guestCode(UUID.randomUUID().toString())
                .deviceToken(deviceToken)
                .status(GuestSessionStatus.ACTIVE)
                .build();

        GuestSession savedGuestSession = guestSessionRepository.save(guestSession);

        tableSession.setLastActivityAt(now);
        tableSessionRepository.save(tableSession);

        return mapToResponse(savedGuestSession);
    }

    public GuestSessionResponse getGuestSession(Long tableSessionId, String deviceToken) {
        GuestSession guestSession = guestSessionRepository
                .findByTableSessionIdAndDeviceToken(tableSessionId, deviceToken)
                .orElseThrow(() -> new RuntimeException(
                        "Guest session not found for tableSessionId: " + tableSessionId + ", deviceToken: " + deviceToken
                ));

        return mapToResponse(guestSession);
    }

    public void closeGuestSession(Long guestSessionId) {
        GuestSession guestSession = guestSessionRepository.findById(guestSessionId)
                .orElseThrow(() -> new RuntimeException("Guest session not found: " + guestSessionId));

        guestSession.setStatus(GuestSessionStatus.CLOSED);
        guestSession.setClosedAt(LocalDateTime.now());
        guestSession.setCloseReason("Guest session closed");

        guestSessionRepository.save(guestSession);
    }

    public void expireGuestSession(Long guestSessionId) {
        GuestSession guestSession = guestSessionRepository.findById(guestSessionId)
                .orElseThrow(() -> new RuntimeException("Guest session not found: " + guestSessionId));

        guestSession.setStatus(GuestSessionStatus.EXPIRED);
        guestSession.setExpiredAt(LocalDateTime.now());
        guestSession.setCloseReason("Guest session expired due to inactivity");

        guestSessionRepository.save(guestSession);
    }

    private GuestSessionResponse mapToResponse(GuestSession guestSession) {
        return GuestSessionResponse.builder()
                .id(guestSession.getId())
                .tableSessionId(guestSession.getTableSession().getId())
                .guestCode(guestSession.getGuestCode())
                .deviceToken(guestSession.getDeviceToken())
                .status(guestSession.getStatus())
                .joinedAt(guestSession.getJoinedAt())
                .lastActivityAt(guestSession.getLastActivityAt())
                .expiredAt(guestSession.getExpiredAt())
                .closedAt(guestSession.getClosedAt())
                .closeReason(guestSession.getCloseReason())
                .createdAt(guestSession.getCreatedAt())
                .updatedAt(guestSession.getUpdatedAt())
                .build();
    }
}