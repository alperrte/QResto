package com.qresto.order_service.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class OrderAdminProductSalesRowResponse {

    private final Long productId;
    private final String productName;
    private final Long quantitySold;
    private final BigDecimal revenue;
    private final Long orderCount;
    /** "up" | "down" | "flat" — dünkü ciroya göre. */
    private final String trend;

    public OrderAdminProductSalesRowResponse(
            Long productId,
            String productName,
            Long quantitySold,
            BigDecimal revenue,
            Long orderCount,
            String trend
    ) {
        this.productId = productId;
        this.productName = productName;
        this.quantitySold = quantitySold != null ? quantitySold : 0L;
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        this.orderCount = orderCount != null ? orderCount : 0L;
        this.trend = trend != null ? trend : "flat";
    }
}
