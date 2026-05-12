package com.qresto.kitchen_service.dto.client;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderResponse {

    private Long id;

    private String orderNo;

    private Long tableId;

    private String tableName;

    private String status;

}