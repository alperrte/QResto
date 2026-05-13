package com.qresto.qr_service.service;

import com.qresto.qr_service.dto.response.OrderContextResponse;
import com.qresto.qr_service.dto.response.TableSessionResponse;
import com.qresto.qr_service.entity.GuestSession;
import com.qresto.qr_service.entity.RestaurantTable;
import com.qresto.qr_service.entity.TableQrCode;
import com.qresto.qr_service.entity.TableSession;
import com.qresto.qr_service.entity.enums.GuestSessionStatus;
import com.qresto.qr_service.entity.enums.TableSessionStatus;
import com.qresto.qr_service.repository.GuestSessionRepository;
import com.qresto.qr_service.repository.RestaurantTableRepository;
import com.qresto.qr_service.repository.TableQrCodeRepository;
import com.qresto.qr_service.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableSessionService {

    private final TableSessionRepository tableSessionRepository;
    private final RestaurantTableRepository restaurantTableRepository;
    private final TableQrCodeRepository tableQrCodeRepository;
    private final GuestSessionRepository guestSessionRepository;

    public TableSessionResponse createTableSession(Long tableId, Long qrCodeId) {
        RestaurantTable table = restaurantTableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));

        TableQrCode qrCode = tableQrCodeRepository.findById(qrCodeId)
                .orElseThrow(() -> new RuntimeException("QR code not found: " + qrCodeId));

        List<TableSessionStatus> activeStatuses = List.of(
                TableSessionStatus.ACTIVE,
                TableSessionStatus.ORDERED,
                TableSessionStatus.PAYMENT_PENDING
        );

        List<TableSession> existingSessions =
                tableSessionRepository.findByRestaurantTableIdAndStatusIn(tableId, activeStatuses);

        if (!existingSessions.isEmpty()) {
            return mapToResponse(existingSessions.get(0));
        }

        TableSession tableSession = TableSession.builder()
                .restaurantTable(table)
                .tableQrCode(qrCode)
                .sessionCode(UUID.randomUUID().toString())
                .status(TableSessionStatus.ACTIVE)
                .build();

        TableSession savedSession = tableSessionRepository.save(tableSession);

        return mapToResponse(savedSession);
    }

    /** Aktif masa + misafir oturumlarını kapatır (QR yenileme / yeni QR taraması). */
    @Transactional
    public void closeActiveTableSessionsWithGuests(
            Long tableId,
            TableSessionStatus newSessionStatus,
            String tableSessionCloseReason,
            String guestSessionCloseReason
    ) {
        List<TableSessionStatus> activeStatuses = List.of(
                TableSessionStatus.ACTIVE,
                TableSessionStatus.ORDERED,
                TableSessionStatus.PAYMENT_PENDING
        );

        List<TableSession> activeSessions =
                tableSessionRepository.findByRestaurantTableIdAndStatusIn(tableId, activeStatuses);

        if (activeSessions.isEmpty()) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        List<Long> tableSessionIds = activeSessions.stream()
                .map(TableSession::getId)
                .toList();

        List<GuestSession> guestSessions =
                guestSessionRepository.findByTableSessionIdIn(tableSessionIds);

        for (GuestSession guestSession : guestSessions) {
            guestSession.setStatus(GuestSessionStatus.CLOSED);
            guestSession.setClosedAt(now);
            guestSession.setCloseReason(guestSessionCloseReason);
        }

        guestSessionRepository.saveAll(guestSessions);

        for (TableSession tableSession : activeSessions) {
            tableSession.setStatus(newSessionStatus);
            tableSession.setClosedAt(now);
            tableSession.setCloseReason(tableSessionCloseReason);
        }

        tableSessionRepository.saveAll(activeSessions);
    }

    /**
     * QR taraması için oturum: aynı QR ile aktif varsa döner; yoksa masadaki diğer aktifleri kapatıp yeni açar.
     * Masaya pessimistic lock ile yarışta çift aktif oturum engellenir.
     */
    @Transactional
    public TableSessionResponse resolveActiveSessionForQrScan(Long tableId, Long qrCodeId) {
        restaurantTableRepository.findByIdForUpdate(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));

        List<TableSessionStatus> activeStatuses = List.of(
                TableSessionStatus.ACTIVE,
                TableSessionStatus.ORDERED,
                TableSessionStatus.PAYMENT_PENDING
        );

        Optional<TableSession> forThisQr = tableSessionRepository
                .findFirstByRestaurantTableIdAndTableQrCode_IdAndStatusInOrderByIdDesc(
                        tableId,
                        qrCodeId,
                        activeStatuses
                );

        if (forThisQr.isPresent()) {
            return mapToResponse(forThisQr.get());
        }

        closeActiveTableSessionsWithGuests(
                tableId,
                TableSessionStatus.CLOSED_BY_ADMIN,
                "Superseded by QR scan",
                "Superseded by QR scan"
        );

        return createTableSession(tableId, qrCodeId);
    }

    public TableSessionResponse getActiveSessionByTable(Long tableId) {
        List<TableSessionStatus> activeStatuses = List.of(
                TableSessionStatus.ACTIVE,
                TableSessionStatus.ORDERED,
                TableSessionStatus.PAYMENT_PENDING
        );

        TableSession tableSession = tableSessionRepository
                .findByRestaurantTableIdAndStatusIn(tableId, activeStatuses)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Active table session not found for table: " + tableId));

        return mapToResponse(tableSession);
    }

    public void closeSessionByPayment(Long tableSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        tableSession.setStatus(TableSessionStatus.COMPLETED);
        tableSession.setCloseReason("Closed by payment");
        tableSession.setClosedAt(java.time.LocalDateTime.now());
        tableSessionRepository.save(tableSession);
    }

    public void closeActiveSessionByTableByWaiter(Long tableId) {
        List<TableSessionStatus> activeStatuses = List.of(
                TableSessionStatus.ACTIVE,
                TableSessionStatus.ORDERED,
                TableSessionStatus.PAYMENT_PENDING
        );

        TableSession tableSession = tableSessionRepository
                .findByRestaurantTableIdAndStatusIn(tableId, activeStatuses)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Active table session not found for table: " + tableId));

        tableSession.setStatus(TableSessionStatus.CLOSED_BY_WAITER);
        tableSession.setCloseReason("Closed by waiter");
        tableSession.setClosedAt(java.time.LocalDateTime.now());

        tableSessionRepository.save(tableSession);
    }
    public void closeSessionByWaiter(Long tableSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        tableSession.setStatus(TableSessionStatus.CLOSED_BY_WAITER);
        tableSession.setCloseReason("Closed by waiter");
        tableSession.setClosedAt(java.time.LocalDateTime.now());

        tableSessionRepository.save(tableSession);
    }

    public void closeSessionByAdmin(Long tableSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        tableSession.setStatus(TableSessionStatus.CLOSED_BY_ADMIN);
        tableSession.setCloseReason("Closed by admin");
        tableSessionRepository.save(tableSession);
    }

    public void expireSession(Long tableSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        tableSession.setStatus(TableSessionStatus.EXPIRED);
        tableSession.setCloseReason("Session expired due to inactivity");
        tableSessionRepository.save(tableSession);
    }

    private TableSessionResponse mapToResponse(TableSession tableSession) {
        return TableSessionResponse.builder()
                .id(tableSession.getId())
                .tableId(tableSession.getRestaurantTable().getId())
                .qrCodeId(tableSession.getTableQrCode() != null ? tableSession.getTableQrCode().getId() : null)
                .sessionCode(tableSession.getSessionCode())
                .status(tableSession.getStatus())
                .startedAt(tableSession.getStartedAt())
                .lastActivityAt(tableSession.getLastActivityAt())
                .closedAt(tableSession.getClosedAt())
                .closeReason(tableSession.getCloseReason())
                .createdAt(tableSession.getCreatedAt())
                .updatedAt(tableSession.getUpdatedAt())
                .build();
    }

    public OrderContextResponse getOrderContext(Long tableSessionId, Long guestSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        GuestSession guestSession = guestSessionRepository.findByIdAndTableSessionId(guestSessionId, tableSessionId)
                .orElseThrow(() -> new RuntimeException("Guest session does not belong to this table session"));

        boolean tableActive = Boolean.TRUE.equals(tableSession.getRestaurantTable().getActive());

        boolean tableSessionAllowed =
                tableSession.getStatus() == TableSessionStatus.ACTIVE ||
                        tableSession.getStatus() == TableSessionStatus.ORDERED ||
                        tableSession.getStatus() == TableSessionStatus.PAYMENT_PENDING;

        boolean guestSessionAllowed =
                guestSession.getStatus() == GuestSessionStatus.ACTIVE;

        boolean orderAllowed = tableActive && tableSessionAllowed && guestSessionAllowed;

        String message = orderAllowed
                ? "Order is allowed for this table session"
                : "Order is not allowed for this table session";

        return OrderContextResponse.builder()
                .tableSessionId(tableSession.getId())
                .guestSessionId(guestSession.getId())
                .tableId(tableSession.getRestaurantTable().getId())
                .tableName(tableSession.getRestaurantTable().getName())
                .tableActive(tableActive)
                .tableSessionStatus(tableSession.getStatus())
                .guestSessionStatus(guestSession.getStatus())
                .orderAllowed(orderAllowed)
                .message(message)
                .build();
    }

    @Transactional
    public TableSessionResponse markPaymentPending(Long tableSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        if (
                tableSession.getStatus() == TableSessionStatus.COMPLETED ||
                        tableSession.getStatus() == TableSessionStatus.CANCELLED ||
                        tableSession.getStatus() == TableSessionStatus.EXPIRED ||
                        tableSession.getStatus() == TableSessionStatus.CLOSED_BY_WAITER ||
                        tableSession.getStatus() == TableSessionStatus.CLOSED_BY_ADMIN
        ) {
            throw new RuntimeException("Kapalı masa oturumu ödeme bekleniyor durumuna alınamaz");
        }

        tableSession.setStatus(TableSessionStatus.PAYMENT_PENDING);
        tableSession.setLastActivityAt(LocalDateTime.now());

        TableSession savedSession = tableSessionRepository.save(tableSession);

        return mapToResponse(savedSession);
    }

    @Transactional
    public TableSessionResponse closeAfterPayment(Long tableSessionId) {
        TableSession tableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found: " + tableSessionId));

        LocalDateTime now = LocalDateTime.now();

        tableSession.setStatus(TableSessionStatus.COMPLETED);
        tableSession.setClosedAt(now);
        tableSession.setCloseReason("PAYMENT_COMPLETED");
        tableSession.setLastActivityAt(now);

        List<GuestSession> guestSessions =
                guestSessionRepository.findByTableSessionIdAndStatus(
                        tableSessionId,
                        GuestSessionStatus.ACTIVE
                );

        for (GuestSession guestSession : guestSessions) {
            guestSession.setStatus(GuestSessionStatus.CLOSED);
            guestSession.setClosedAt(now);
            guestSession.setCloseReason("PAYMENT_COMPLETED");
            guestSession.setLastActivityAt(now);
        }

        guestSessionRepository.saveAll(guestSessions);

        TableSession savedSession = tableSessionRepository.save(tableSession);

        return mapToResponse(savedSession);
    }
}