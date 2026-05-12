package com.qresto.order_service.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

/**
 * JPQL aggregate row (trend hesaplaması service katmanında).
 */
@Getter
public class OrderAdminProductSalesAggregateResponse {

    private final Long productId;
    private final String productName;
    private final Long quantitySold;
    private final BigDecimal revenue;
    private final Long orderCount;

    public OrderAdminProductSalesAggregateResponse(
            Long productId,
            String productName,
            Long quantitySold,
            BigDecimal revenue,
            Long orderCount
    ) {
        this.productId = productId;
        this.productName = productName;
        this.quantitySold = quantitySold != null ? quantitySold : 0L;
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        this.orderCount = orderCount != null ? orderCount : 0L;
    }
}
