package com.qresto.waiter_service.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class QrTableResponse {

    private Long id;

    private String name;

    private Integer capacity;

    private Boolean active;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}