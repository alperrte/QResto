package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class OrderResponse {

    private Long id;
    private String orderNo;
    private Long tableSessionId;
    private Long guestSessionId;
    private Long tableId;
    private String tableName;
    private String status;
    private BigDecimal totalAmount;
    private LocalDateTime paidAt;
}