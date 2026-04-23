package com.qresto.qr_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QrScanResponse {

    private RestaurantTableResponse table;
    private TableSessionResponse tableSession;
    private GuestSessionResponse guestSession;
    private String message;
}