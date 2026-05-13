package com.qresto.qr_service.service;

import com.qresto.qr_service.dto.request.QrScanRequest;
import com.qresto.qr_service.dto.response.GuestSessionResponse;
import com.qresto.qr_service.dto.response.QrScanResponse;
import com.qresto.qr_service.dto.response.QrValidationResponse;
import com.qresto.qr_service.dto.response.RestaurantTableResponse;
import com.qresto.qr_service.dto.response.TableSessionResponse;
import com.qresto.qr_service.entity.RestaurantTable;
import com.qresto.qr_service.entity.TableQrCode;
import com.qresto.qr_service.entity.TableSession;
import com.qresto.qr_service.repository.TableQrCodeRepository;
import com.qresto.qr_service.repository.TableSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class QrService {

    private final TableQrCodeRepository tableQrCodeRepository;
    private final TableSessionRepository tableSessionRepository;
    private final TableSessionService tableSessionService;
    private final GuestSessionService guestSessionService;

    public QrValidationResponse validateQr(String qrToken) {
        TableQrCode qrCode = tableQrCodeRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("QR not found"));

        RestaurantTable table = qrCode.getRestaurantTable();

        return QrValidationResponse.builder()
                .valid(qrCode.getActive() && table.getActive())
                .tableId(table.getId())
                .tableName(table.getName())
                .tableActive(table.getActive())
                .qrActive(qrCode.getActive())
                .build();
    }

    public QrScanResponse scanQr(QrScanRequest request) {
        TableQrCode qrCode = tableQrCodeRepository.findByQrToken(request.getQrToken())
                .orElseThrow(() -> new RuntimeException("QR not found"));

        if (!Boolean.TRUE.equals(qrCode.getActive())) {
            throw new RuntimeException("QR is inactive");
        }

        RestaurantTable table = qrCode.getRestaurantTable();

        if (!Boolean.TRUE.equals(table.getActive())) {
            throw new RuntimeException("Table is inactive");
        }

        TableSessionResponse resolvedSession =
                tableSessionService.resolveActiveSessionForQrScan(table.getId(), qrCode.getId());
        Long tableSessionId = resolvedSession.getId();

        GuestSessionResponse guestSessionResponse = guestSessionService.createGuestSession(
                tableSessionId,
                request.getDeviceToken()
        );

        TableSession refreshedTableSession = tableSessionRepository.findById(tableSessionId)
                .orElseThrow(() -> new RuntimeException("Table session not found after scan: " + tableSessionId));

        TableSessionResponse tableSessionResponse = mapTableSessionToResponse(refreshedTableSession);

        RestaurantTableResponse tableResponse = RestaurantTableResponse.builder()
                .id(table.getId())
                .name(table.getName())
                .capacity(table.getCapacity())
                .active(table.getActive())
                .createdAt(table.getCreatedAt())
                .updatedAt(table.getUpdatedAt())
                .build();

        return QrScanResponse.builder()
                .table(tableResponse)
                .tableSession(tableSessionResponse)
                .guestSession(guestSessionResponse)
                .message("QR scanned successfully")
                .build();
    }

    private TableSessionResponse mapTableSessionToResponse(TableSession tableSession) {
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
}