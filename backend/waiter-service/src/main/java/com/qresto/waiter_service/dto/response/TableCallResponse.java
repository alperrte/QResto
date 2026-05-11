package com.qresto.waiter_service.dto.response;

import com.qresto.waiter_service.enums.TableCallStatus;
import com.qresto.waiter_service.enums.TableCallType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class TableCallResponse {

    private Long id;

    private Long tableId;

    private Integer tableNumber;

    private TableCallType callType;

    private TableCallStatus status;

    private String message;

    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    private String resolvedBy;
}