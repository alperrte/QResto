package com.qresto.rating_service.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class ProductRatingResponse {

    private Long id;

    private Long orderId;

    private Long orderItemId;

    private Long productId;

    private Long tableSessionId;

    private Long guestSessionId;

    private Long tableId;

    private String tableName;

    private Integer rating;

    private String comment;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}