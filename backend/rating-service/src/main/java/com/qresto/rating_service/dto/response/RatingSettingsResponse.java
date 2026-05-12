package com.qresto.rating_service.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RatingSettingsResponse {

    private Long id;

    private Boolean ratingServiceEnabled;

    private Boolean restaurantRatingsEnabled;

    private Boolean restaurantCommentsEnabled;

    private Boolean productRatingsEnabled;

    private Boolean productCommentsEnabled;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}