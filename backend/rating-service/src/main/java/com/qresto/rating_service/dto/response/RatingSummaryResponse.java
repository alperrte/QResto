package com.qresto.rating_service.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class RatingSummaryResponse {

    private Long targetId;

    private String targetType;

    private Double averageRating;

    private Long totalRatingCount;
}