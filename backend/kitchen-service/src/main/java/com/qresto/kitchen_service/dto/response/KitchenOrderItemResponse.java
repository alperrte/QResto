package com.qresto.kitchen_service.dto.response;

import com.qresto.kitchen_service.entity.enums.KitchenItemStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KitchenOrderItemResponse {

    private Long id;

    private Long productId;

    private String productName;

    private Integer quantity;

    private String note;

    private KitchenItemStatus status;

}