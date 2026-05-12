package com.qresto.kitchen_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class KitchenCancelLogResponse {

    private Long id;

    private String cancelReason;

    private String cancelledBy;

    private LocalDateTime createdAt;

}