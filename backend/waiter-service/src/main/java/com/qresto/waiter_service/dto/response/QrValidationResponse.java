package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QrValidationResponse {

    private Boolean valid;

    private Long tableId;

    private Integer tableNo;

    private String tableName;

    private Boolean tableActive;

    private Boolean qrActive;
}