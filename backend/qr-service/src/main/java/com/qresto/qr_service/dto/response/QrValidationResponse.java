package com.qresto.qr_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QrValidationResponse {

    private Boolean valid;
    private Long tableId;
    private Integer tableNo;
    private String tableName;
    private Boolean tableActive;
    private Boolean qrActive;
}