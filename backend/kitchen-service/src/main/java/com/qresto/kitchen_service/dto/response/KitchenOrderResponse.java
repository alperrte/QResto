package com.qresto.kitchen_service.dto.response;

import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class KitchenOrderResponse {

    private Long id;

    private Long orderId;

    private Integer tableNumber;

    private KitchenOrderStatus status;

    private LocalDateTime createdAt;

}