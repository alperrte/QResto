package com.qresto.rating_service.repository;

import com.qresto.rating_service.entity.ProductRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRatingRepository extends JpaRepository<ProductRating, Long> {

    boolean existsByOrderIdAndOrderItemIdAndGuestSessionId(Long orderId, Long orderItemId, Long guestSessionId);

    List<ProductRating> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<ProductRating> findTop10ByOrderByCreatedAtDesc();

    @Query("""
            SELECT COALESCE(AVG(p.rating), 0)
            FROM ProductRating p
            WHERE p.productId = :productId
            """)
    Double calculateAverageRatingByProductId(Long productId);

    Long countByProductId(Long productId);
}