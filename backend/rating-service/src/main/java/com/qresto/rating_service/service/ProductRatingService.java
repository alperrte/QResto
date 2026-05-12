package com.qresto.rating_service.service;

import com.qresto.rating_service.client.OrderClientService;
import com.qresto.rating_service.dto.client.OrderItemResponse;
import com.qresto.rating_service.dto.client.OrderResponse;
import com.qresto.rating_service.dto.request.ProductRatingCreateRequest;
import com.qresto.rating_service.dto.response.ProductRatingResponse;
import com.qresto.rating_service.dto.response.RatingSummaryResponse;
import com.qresto.rating_service.entity.ProductRating;
import com.qresto.rating_service.exception.RatingException;
import com.qresto.rating_service.repository.ProductRatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductRatingService {

    private final ProductRatingRepository productRatingRepository;
    private final OrderClientService orderClientService;
    private final RatingSettingService ratingSettingService;

    public ProductRatingResponse createProductRating(ProductRatingCreateRequest request) {
        ratingSettingService.validateProductRatingAllowed(request.getComment());

        OrderResponse order = orderClientService.getOrderById(request.getOrderId());

        validateOrderForRating(order, request.getGuestSessionId());

        OrderItemResponse orderItem = findOrderItem(order, request.getOrderItemId());

        validateOrderItemForRating(orderItem);

        boolean alreadyRated = productRatingRepository.existsByOrderIdAndOrderItemIdAndGuestSessionId(
                request.getOrderId(),
                request.getOrderItemId(),
                request.getGuestSessionId()
        );

        if (alreadyRated) {
            throw new RatingException("Bu ürün bu sipariş için daha önce değerlendirilmiş");
        }

        ProductRating productRating = ProductRating.builder()
                .orderId(order.getId())
                .orderItemId(orderItem.getId())
                .productId(orderItem.getProductId())
                .tableSessionId(order.getTableSessionId())
                .guestSessionId(order.getGuestSessionId())
                .tableId(order.getTableId())
                .tableName(order.getTableName())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        ProductRating savedRating = productRatingRepository.save(productRating);

        return mapToResponse(savedRating);
    }

    public List<ProductRatingResponse> getRatingsByProductId(Long productId) {
        return productRatingRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ProductRatingResponse> getRecentProductRatings() {
        return productRatingRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public RatingSummaryResponse getProductRatingSummary(Long productId) {
        Double averageRating = productRatingRepository.calculateAverageRatingByProductId(productId);
        Long totalRatingCount = productRatingRepository.countByProductId(productId);

        return RatingSummaryResponse.builder()
                .targetId(productId)
                .targetType("PRODUCT")
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

    private OrderItemResponse findOrderItem(OrderResponse order, Long orderItemId) {
        if (order.getItems() == null || order.getItems().isEmpty()) {
            throw new RatingException("Sipariş içinde ürün bulunamadı");
        }

        return order.getItems()
                .stream()
                .filter(item -> item.getId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new RatingException("Değerlendirilecek ürün bu sipariş içinde bulunamadı"));
    }

    private void validateOrderItemForRating(OrderItemResponse orderItem) {
        if (!"ACTIVE".equals(orderItem.getStatus())) {
            throw new RatingException("İptal edilmiş ürün değerlendirilemez");
        }
    }

    private ProductRatingResponse mapToResponse(ProductRating productRating) {
        return ProductRatingResponse.builder()
                .id(productRating.getId())
                .orderId(productRating.getOrderId())
                .orderItemId(productRating.getOrderItemId())
                .productId(productRating.getProductId())
                .tableSessionId(productRating.getTableSessionId())
                .guestSessionId(productRating.getGuestSessionId())
                .tableId(productRating.getTableId())
                .tableName(productRating.getTableName())
                .rating(productRating.getRating())
                .comment(productRating.getComment())
                .createdAt(productRating.getCreatedAt())
                .updatedAt(productRating.getUpdatedAt())
                .build();
    }


}