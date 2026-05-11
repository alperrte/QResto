package com.qresto.rating_service.service;

import com.qresto.rating_service.client.OrderClientService;
import com.qresto.rating_service.dto.client.OrderResponse;
import com.qresto.rating_service.dto.request.RestaurantRatingCreateRequest;
import com.qresto.rating_service.dto.response.RatingSummaryResponse;
import com.qresto.rating_service.dto.response.RestaurantRatingResponse;
import com.qresto.rating_service.entity.RestaurantRating;
import com.qresto.rating_service.exception.RatingException;
import com.qresto.rating_service.repository.RestaurantRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestaurantRatingService {

    private final RestaurantRatingRepository restaurantRatingRepository;
    private final OrderClientService orderClientService;

    public RestaurantRatingResponse createRestaurantRating(RestaurantRatingCreateRequest request) {
        OrderResponse order = orderClientService.getOrderById(request.getOrderId());

        validateOrderForRating(order, request.getGuestSessionId());

        boolean alreadyRated = restaurantRatingRepository.existsByOrderIdAndGuestSessionId(
                request.getOrderId(),
                request.getGuestSessionId()
        );

        if (alreadyRated) {
            throw new RatingException("Bu sipariş için restoran daha önce değerlendirilmiş");
        }

        RestaurantRating restaurantRating = RestaurantRating.builder()
                .orderId(order.getId())
                .tableSessionId(order.getTableSessionId())
                .guestSessionId(order.getGuestSessionId())
                .tableId(order.getTableId())
                .tableName(order.getTableName())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        RestaurantRating savedRating = restaurantRatingRepository.save(restaurantRating);

        return mapToResponse(savedRating);
    }

    public List<RestaurantRatingResponse> getAllRestaurantRatings() {
        return restaurantRatingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<RestaurantRatingResponse> getRecentRestaurantRatings() {
        return restaurantRatingRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RatingSummaryResponse getRestaurantRatingSummary() {
        Double averageRating = restaurantRatingRepository.calculateAverageRating();
        Long totalRatingCount = restaurantRatingRepository.count();

        return RatingSummaryResponse.builder()
                .targetId(null)
                .targetType("RESTAURANT")
                .averageRating(averageRating)
                .totalRatingCount(totalRatingCount)
                .build();
    }

    private void validateOrderForRating(OrderResponse order, Long guestSessionId) {
        if (order == null) {
            throw new RatingException("Sipariş bulunamadı");
        }

        if (!"PAID".equals(order.getStatus())) {
            throw new RatingException("Sadece ödemesi tamamlanmış siparişler değerlendirilebilir");
        }

        if (!order.getGuestSessionId().equals(guestSessionId)) {
            throw new RatingException("Bu sipariş bu kullanıcı oturumuna ait değil");
        }
    }

    private RestaurantRatingResponse mapToResponse(RestaurantRating restaurantRating) {
        return RestaurantRatingResponse.builder()
                .id(restaurantRating.getId())
                .orderId(restaurantRating.getOrderId())
                .tableSessionId(restaurantRating.getTableSessionId())
                .guestSessionId(restaurantRating.getGuestSessionId())
                .tableId(restaurantRating.getTableId())
                .tableName(restaurantRating.getTableName())
                .rating(restaurantRating.getRating())
                .comment(restaurantRating.getComment())
                .createdAt(restaurantRating.getCreatedAt())
                .updatedAt(restaurantRating.getUpdatedAt())
                .build();
    }
}