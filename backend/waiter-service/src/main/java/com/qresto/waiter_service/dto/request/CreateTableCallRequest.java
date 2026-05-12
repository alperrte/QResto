package com.qresto.waiter_service.dto.request;

import com.qresto.waiter_service.enums.TableCallType;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateTableCallRequest {

    @NotNull(message = "Table id boş olamaz")
    private Long tableId;

    private Integer tableNumber;

    @NotNull(message = "Çağrı tipi boş olamaz")
    private TableCallType callType;

    private String message;
}