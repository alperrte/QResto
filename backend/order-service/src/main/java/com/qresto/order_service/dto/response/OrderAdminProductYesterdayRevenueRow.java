package com.qresto.order_service.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class OrderAdminProductYesterdayRevenueRow {

    private final Long productId;
    private final BigDecimal revenue;

    public OrderAdminProductYesterdayRevenueRow(Long productId, BigDecimal revenue) {
        this.productId = productId;
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
    }
}
