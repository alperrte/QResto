package com.qresto.kitchen_service.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateKitchenCancelLogRequest {

    private String cancelReason;

    private String cancelledBy;

}