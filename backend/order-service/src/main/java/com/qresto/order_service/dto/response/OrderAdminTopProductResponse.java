package com.qresto.order_service.dto.response;

import lombok.Getter;

import java.math.BigDecimal;

/**
 * Admin dashboard: bugünkü ödenmiş/tamamlanmış siparişlerde en çok ciro yapan ürün satırı.
 */
@Getter
public class OrderAdminTopProductResponse {

    private final Long productId;
    private final String productName;
    private final Long quantitySold;
    private final BigDecimal revenue;
    private final String productImageUrl;

    public OrderAdminTopProductResponse(
            Long productId,
            String productName,
            Long quantitySold,
            BigDecimal revenue,
            String productImageUrl
    ) {
        this.productId = productId;
        this.productName = productName;
        this.quantitySold = quantitySold != null ? quantitySold : 0L;
        this.revenue = revenue != null ? revenue : BigDecimal.ZERO;
        this.productImageUrl = productImageUrl;
    }
}
