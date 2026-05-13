package com.qresto.qr_service.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.qrcode.QRCodeWriter;
import com.qresto.qr_service.dto.response.TableQrCodeResponse;
import com.qresto.qr_service.entity.RestaurantTable;
import com.qresto.qr_service.entity.TableQrCode;
import com.qresto.qr_service.entity.enums.TableSessionStatus;
import com.qresto.qr_service.repository.RestaurantTableRepository;
import com.qresto.qr_service.repository.TableQrCodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableQrCodeService {

    @Value("${app.frontend-url}")
    private String frontendUrl;

    private final TableQrCodeRepository qrRepository;
    private final RestaurantTableRepository tableRepository;
    private final TableSessionService tableSessionService;

    public TableQrCodeResponse generateQrCode(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));

        return qrRepository.findByRestaurantTableIdAndActiveTrue(tableId)
                .map(this::mapToResponse)
                .orElseGet(() -> createNewQr(table, 1));
    }

    public TableQrCodeResponse regenerateQrCode(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found: " + tableId));

        closeActiveSessionsForTable(tableId);

        return qrRepository.findFirstByRestaurantTableIdOrderByVersionNoDesc(tableId)
                .map(this::mapToResponse)
                .orElseGet(() -> createNewQr(table, 1));
    }

    public TableQrCodeResponse getActiveQrCode(Long tableId) {
        TableQrCode qr = qrRepository.findByRestaurantTableIdAndActiveTrue(tableId)
                .orElseThrow(() -> new RuntimeException("Active QR not found for table: " + tableId));

        return mapToResponse(qr);
    }

    public byte[] getQrImage(String qrToken) {
        TableQrCode qr = qrRepository.findByQrToken(qrToken)
                .orElseThrow(() -> new RuntimeException("QR not found"));

        String qrContent = frontendUrl + "/qr/scan?token=" + qr.getQrToken();
        return generateQrImage(qrContent);
    }

    public TableQrCodeResponse activateQrCode(Long tableId) {
        TableQrCode qr = qrRepository.findFirstByRestaurantTableIdOrderByVersionNoDesc(tableId)
                .orElseThrow(() -> new RuntimeException("QR not found for table: " + tableId));

        qr.setActive(true);

        TableQrCode savedQr = qrRepository.save(qr);

        return mapToResponse(savedQr);
    }

    public TableQrCodeResponse deactivateQrCode(Long tableId) {
        TableQrCode qr = qrRepository.findFirstByRestaurantTableIdOrderByVersionNoDesc(tableId)
                .orElseThrow(() -> new RuntimeException("QR not found for table: " + tableId));

        qr.setActive(false);

        TableQrCode savedQr = qrRepository.save(qr);

        return mapToResponse(savedQr);
    }

    private void closeActiveSessionsForTable(Long tableId) {
        tableSessionService.closeActiveTableSessionsWithGuests(
                tableId,
                TableSessionStatus.CLOSED_BY_ADMIN,
                "Closed because QR was refreshed",
                "Closed because QR was refreshed"
        );
    }

    private TableQrCodeResponse createNewQr(RestaurantTable table, int version) {
        String token = UUID.randomUUID().toString();

        TableQrCode qr = TableQrCode.builder()
                .restaurantTable(table)
                .qrToken(token)
                .versionNo(version)
                .active(true)
                .build();

        TableQrCode saved = qrRepository.save(qr);

        return mapToResponse(saved);
    }

    private byte[] generateQrImage(String content) {
        try {
            QRCodeWriter writer = new QRCodeWriter();
            var bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, 300, 300);

            int width = bitMatrix.getWidth();
            int height = bitMatrix.getHeight();

            StringBuilder sb = new StringBuilder();

            for (int y = 0; y < height; y++) {
                for (int x = 0; x < width; x++) {
                    sb.append(bitMatrix.get(x, y) ? "██" : "  ");
                }
                sb.append("\n");
            }

            return sb.toString().getBytes(StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("QR image generation failed", e);
        }
    }

    private TableQrCodeResponse mapToResponse(TableQrCode qr) {
        String qrContent = frontendUrl + "/qr/scan?token=" + qr.getQrToken();

        return TableQrCodeResponse.builder()
                .id(qr.getId())
                .tableId(qr.getRestaurantTable().getId())
                .qrUuid(qr.getQrUuid())
                .qrToken(qr.getQrToken())
                .qrImageUrl(qr.getQrImageUrl())
                .qrContent(qrContent)
                .versionNo(qr.getVersionNo())
                .active(qr.getActive())
                .createdAt(qr.getCreatedAt())
                .updatedAt(qr.getUpdatedAt())
                .build();
    }
}
