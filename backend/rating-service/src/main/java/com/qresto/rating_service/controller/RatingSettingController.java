package com.qresto.rating_service.controller;

import com.qresto.rating_service.dto.request.RatingSettingToggleRequest;
import com.qresto.rating_service.dto.request.RatingSettingsUpdateRequest;
import com.qresto.rating_service.dto.response.RatingSettingsResponse;
import com.qresto.rating_service.service.RatingSettingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rating/settings")
@RequiredArgsConstructor
public class RatingSettingController {

    private final RatingSettingService ratingSettingService;

    @GetMapping
    public RatingSettingsResponse getSettings() {
        return ratingSettingService.getSettings();
    }

    @PutMapping
    public RatingSettingsResponse updateSettings(@Valid @RequestBody RatingSettingsUpdateRequest request) {
        return ratingSettingService.updateSettings(request);
    }

    @PatchMapping("/rating-service")
    public RatingSettingsResponse toggleRatingService(@Valid @RequestBody RatingSettingToggleRequest request) {
        return ratingSettingService.toggleRatingService(request);
    }

    @PatchMapping("/restaurant-ratings")
    public RatingSettingsResponse toggleRestaurantRatings(@Valid @RequestBody RatingSettingToggleRequest request) {
        return ratingSettingService.toggleRestaurantRatings(request);
    }

    @PatchMapping("/restaurant-comments")
    public RatingSettingsResponse toggleRestaurantComments(@Valid @RequestBody RatingSettingToggleRequest request) {
        return ratingSettingService.toggleRestaurantComments(request);
    }

    @PatchMapping("/product-ratings")
    public RatingSettingsResponse toggleProductRatings(@Valid @RequestBody RatingSettingToggleRequest request) {
        return ratingSettingService.toggleProductRatings(request);
    }

    @PatchMapping("/product-comments")
    public RatingSettingsResponse toggleProductComments(@Valid @RequestBody RatingSettingToggleRequest request) {
        return ratingSettingService.toggleProductComments(request);
    }
}