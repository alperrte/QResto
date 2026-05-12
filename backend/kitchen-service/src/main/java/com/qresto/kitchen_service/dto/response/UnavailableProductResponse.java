package com.qresto.kitchen_service.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UnavailableProductResponse {

    private Long id;

    private Long productId;

    private String productName;

    private String reason;

    private Boolean isActive;

}