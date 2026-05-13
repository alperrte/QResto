package com.qresto.order_service.dto.response;

import lombok.Getter;

@Getter
public class OrderAdminTableHeatmapCellResponse {

    private final Long tableId;
    private final String label;
    private final Long orderCount;
    /** "high" | "medium" | "low" — bugünkü sipariş sayısına göre göreli yoğunluk. */
    private final String level;

    public OrderAdminTableHeatmapCellResponse(
            Long tableId,
            String label,
            Long orderCount,
            String level
    ) {
        this.tableId = tableId;
        this.label = label;
        this.orderCount = orderCount != null ? orderCount : 0L;
        this.level = level != null ? level : "low";
    }
}
