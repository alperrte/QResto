package com.qresto.kitchen_service.dto.request;

import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateKitchenOrderStatusRequest {

    private KitchenOrderStatus status;

}