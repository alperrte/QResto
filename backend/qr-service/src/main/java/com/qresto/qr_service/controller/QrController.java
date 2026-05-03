package com.qresto.qr_service.controller;

import com.qresto.qr_service.dto.request.QrScanRequest;
import com.qresto.qr_service.dto.response.QrScanResponse;
import com.qresto.qr_service.dto.response.QrValidationResponse;
import com.qresto.qr_service.service.QrService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/qr")
@RequiredArgsConstructor
public class QrController {

    private final QrService qrService;

    @GetMapping("/validate")
    public QrValidationResponse validateQr(@RequestParam String token) {
        return qrService.validateQr(token);
    }

    @PostMapping("/scan")
    public QrScanResponse scanQr(@Valid @RequestBody QrScanRequest request) {
        return qrService.scanQr(request);
    }
}