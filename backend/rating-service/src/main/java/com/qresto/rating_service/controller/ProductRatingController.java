package com.qresto.rating_service.controller;

import com.qresto.rating_service.dto.request.ProductRatingCreateRequest;
import com.qresto.rating_service.dto.response.ProductRatingResponse;
import com.qresto.rating_service.dto.response.RatingSummaryResponse;
import com.qresto.rating_service.service.ProductRatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rating/product-ratings")
@RequiredArgsConstructor
public class ProductRatingController {

    private final ProductRatingService productRatingService;

    @PostMapping
    public ProductRatingResponse createProductRating(@Valid @RequestBody ProductRatingCreateRequest request) {
        return productRatingService.createProductRating(request);
    }

    @GetMapping("/product/{productId}")
    public List<ProductRatingResponse> getRatingsByProductId(@PathVariable Long productId) {
        return productRatingService.getRatingsByProductId(productId);
    }

    @GetMapping("/product/{productId}/summary")
    public RatingSummaryResponse getProductRatingSummary(@PathVariable Long productId) {
        return productRatingService.getProductRatingSummary(productId);
    }

    @GetMapping("/recent")
    public List<ProductRatingResponse> getRecentProductRatings() {
        return productRatingService.getRecentProductRatings();
    }
}