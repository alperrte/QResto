package com.qresto.order_service.dto.client;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QrOrderContextResponse {

    private Long tableSessionId;

    private Long guestSessionId;

    private Long tableId;

    private String tableName;

    private Boolean tableActive;

    private String tableSessionStatus;

    private String guestSessionStatus;

    private Boolean orderAllowed;

    private String message;
}