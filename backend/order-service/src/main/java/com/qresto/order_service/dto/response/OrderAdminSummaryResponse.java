package com.qresto.order_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderAdminSummaryResponse {

    private Long activeOrderCount;

    private Long completedOrderCount;

    private Long cancelledOrderCount;

    private Long totalOrderCount;

    private BigDecimal todayRevenue;

    private Integer operationDensity;
}