package com.qresto.order_service.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CartCreateRequest {

    @NotNull
    private Long tableSessionId;

    @NotNull
    private Long guestSessionId;

    @NotNull
    private Long tableId;

    private String tableName;
}