package com.qresto.order_service.dto.response;

import lombok.Getter;

@Getter
public class OrderAdminTableHeatmapAggregateResponse {

    private final Long tableId;
    private final String tableName;
    private final Long orderCount;

    public OrderAdminTableHeatmapAggregateResponse(Long tableId, String tableName, Long orderCount) {
        this.tableId = tableId;
        this.tableName = tableName;
        this.orderCount = orderCount != null ? orderCount : 0L;
    }
}
