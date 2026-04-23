package com.qresto.qr_service.controller;

import com.qresto.qr_service.dto.response.TableQrCodeResponse;
import com.qresto.qr_service.service.TableQrCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr-codes")
@RequiredArgsConstructor
public class TableQrCodeController {

    private final TableQrCodeService tableQrCodeService;

    @PostMapping("/table/{tableId}")
    public TableQrCodeResponse generateQrCode(@PathVariable Long tableId) {
        return tableQrCodeService.generateQrCode(tableId);
    }

    @PostMapping("/table/{tableId}/regenerate")
    public TableQrCodeResponse regenerateQrCode(@PathVariable Long tableId) {
        return tableQrCodeService.regenerateQrCode(tableId);
    }

    @GetMapping("/table/{tableId}/active")
    public TableQrCodeResponse getActiveQrCode(@PathVariable Long tableId) {
        return tableQrCodeService.getActiveQrCode(tableId);
    }

    @GetMapping("/{qrToken}/image")
    public ResponseEntity<byte[]> getQrImage(@PathVariable String qrToken) {
        byte[] qrImage = tableQrCodeService.getQrImage(qrToken);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=qr.txt")
                .contentType(MediaType.TEXT_PLAIN)
                .body(qrImage);
    }
}