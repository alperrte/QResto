package com.qresto.qr_service.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class RestaurantTableResponse {

    private Long id;
    private Integer tableNo;
    private String name;
    private Integer capacity;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}