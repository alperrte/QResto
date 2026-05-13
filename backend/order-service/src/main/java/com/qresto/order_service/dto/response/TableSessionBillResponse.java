package com.qresto.order_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class TableSessionBillResponse {

    private Long tableSessionId;

    private Long tableId;

    private String tableName;

    private BigDecimal subtotalAmount;

    private BigDecimal vatAmount;

    private BigDecimal totalAmount;

    private Integer orderCount;

    private List<OrderResponse> orders;
}