package com.qresto.rating_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "rating_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RatingSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rating_service_enabled", nullable = false)
    private Boolean ratingServiceEnabled;

    @Column(name = "restaurant_ratings_enabled", nullable = false)
    private Boolean restaurantRatingsEnabled;

    @Column(name = "restaurant_comments_enabled", nullable = false)
    private Boolean restaurantCommentsEnabled;

    @Column(name = "product_ratings_enabled", nullable = false)
    private Boolean productRatingsEnabled;

    @Column(name = "product_comments_enabled", nullable = false)
    private Boolean productCommentsEnabled;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;

        if (this.ratingServiceEnabled == null) {
            this.ratingServiceEnabled = true;
        }

        if (this.restaurantRatingsEnabled == null) {
            this.restaurantRatingsEnabled = true;
        }

        if (this.restaurantCommentsEnabled == null) {
            this.restaurantCommentsEnabled = true;
        }

        if (this.productRatingsEnabled == null) {
            this.productRatingsEnabled = true;
        }

        if (this.productCommentsEnabled == null) {
            this.productCommentsEnabled = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}