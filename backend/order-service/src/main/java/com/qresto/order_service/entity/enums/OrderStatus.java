package com.qresto.order_service.entity.enums;

public enum OrderStatus {
    RECEIVED,
    PREPARING,
    READY,
    SERVED,
    COMPLETED,
    PAYMENT_PENDING,
    PAID,
    CANCELLED
}