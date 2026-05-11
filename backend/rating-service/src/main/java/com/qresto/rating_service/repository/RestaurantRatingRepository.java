package com.qresto.rating_service.repository;

import com.qresto.rating_service.entity.RestaurantRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface RestaurantRatingRepository extends JpaRepository<RestaurantRating, Long> {

    boolean existsByOrderIdAndGuestSessionId(Long orderId, Long guestSessionId);

    List<RestaurantRating> findAllByOrderByCreatedAtDesc();

    List<RestaurantRating> findTop10ByOrderByCreatedAtDesc();

    @Query("""
            SELECT COALESCE(AVG(r.rating), 0)
            FROM RestaurantRating r
            """)
    Double calculateAverageRating();

    long count();
}