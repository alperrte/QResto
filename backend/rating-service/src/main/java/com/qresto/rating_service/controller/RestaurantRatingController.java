package com.qresto.rating_service.controller;

import com.qresto.rating_service.dto.request.RestaurantRatingCreateRequest;
import com.qresto.rating_service.dto.response.RatingSummaryResponse;
import com.qresto.rating_service.dto.response.RestaurantRatingResponse;
import com.qresto.rating_service.service.RestaurantRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rating/restaurant-ratings")
@RequiredArgsConstructor
public class RestaurantRatingController {

    private final RestaurantRatingService restaurantRatingService;

    @PostMapping
    public RestaurantRatingResponse createRestaurantRating(@Valid @RequestBody RestaurantRatingCreateRequest request) {
        return restaurantRatingService.createRestaurantRating(request);
    }

    @GetMapping
    public List<RestaurantRatingResponse> getAllRestaurantRatings() {
        return restaurantRatingService.getAllRestaurantRatings();
    }

    @GetMapping("/summary")
    public RatingSummaryResponse getRestaurantRatingSummary() {
        return restaurantRatingService.getRestaurantRatingSummary();
    }

    @GetMapping("/recent")
    public List<RestaurantRatingResponse> getRecentRestaurantRatings() {
        return restaurantRatingService.getRecentRestaurantRatings();
    }
}