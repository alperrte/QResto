package com.qresto.qr_service.dto.response;

import com.qresto.qr_service.entity.enums.GuestSessionStatus;
import com.qresto.qr_service.entity.enums.TableSessionStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderContextResponse {

    private Long tableSessionId;

    private Long guestSessionId;

    private Long tableId;

    private String tableName;

    private Boolean tableActive;

    private TableSessionStatus tableSessionStatus;

    private GuestSessionStatus guestSessionStatus;

    private Boolean orderAllowed;

    private String message;
}