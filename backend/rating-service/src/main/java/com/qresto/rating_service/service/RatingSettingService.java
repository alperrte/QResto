package com.qresto.rating_service.service;

import com.qresto.rating_service.dto.request.RatingSettingToggleRequest;
import com.qresto.rating_service.dto.request.RatingSettingsUpdateRequest;
import com.qresto.rating_service.dto.response.RatingSettingsResponse;
import com.qresto.rating_service.entity.RatingSetting;
import com.qresto.rating_service.exception.RatingException;
import com.qresto.rating_service.repository.RatingSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RatingSettingService {

    private final RatingSettingRepository ratingSettingRepository;

    public RatingSettingsResponse getSettings() {
        RatingSetting setting = getOrCreateSettings();

        return mapToResponse(setting);
    }

    public RatingSettingsResponse updateSettings(RatingSettingsUpdateRequest request) {
        RatingSetting setting = getOrCreateSettings();

        setting.setRatingServiceEnabled(request.getRatingServiceEnabled());
        setting.setRestaurantRatingsEnabled(request.getRestaurantRatingsEnabled());
        setting.setRestaurantCommentsEnabled(request.getRestaurantCommentsEnabled());
        setting.setProductRatingsEnabled(request.getProductRatingsEnabled());
        setting.setProductCommentsEnabled(request.getProductCommentsEnabled());

        RatingSetting savedSetting = ratingSettingRepository.save(setting);

        return mapToResponse(savedSetting);
    }

    public RatingSettingsResponse toggleRatingService(RatingSettingToggleRequest request) {
        RatingSetting setting = getOrCreateSettings();

        setting.setRatingServiceEnabled(request.getEnabled());

        if (Boolean.TRUE.equals(request.getEnabled())) {
            setting.setRestaurantRatingsEnabled(true);
            setting.setRestaurantCommentsEnabled(true);
            setting.setProductRatingsEnabled(true);
            setting.setProductCommentsEnabled(true);
        }

        if (Boolean.FALSE.equals(request.getEnabled())) {
            setting.setRestaurantRatingsEnabled(false);
            setting.setRestaurantCommentsEnabled(false);
            setting.setProductRatingsEnabled(false);
            setting.setProductCommentsEnabled(false);
        }

        RatingSetting savedSetting = ratingSettingRepository.save(setting);

        return mapToResponse(savedSetting);
    }

    public RatingSettingsResponse toggleRestaurantRatings(RatingSettingToggleRequest request) {
        RatingSetting setting = getOrCreateSettings();

        setting.setRestaurantRatingsEnabled(request.getEnabled());

        RatingSetting savedSetting = ratingSettingRepository.save(setting);

        return mapToResponse(savedSetting);
    }

    public RatingSettingsResponse toggleRestaurantComments(RatingSettingToggleRequest request) {
        RatingSetting setting = getOrCreateSettings();

        setting.setRestaurantCommentsEnabled(request.getEnabled());

        RatingSetting savedSetting = ratingSettingRepository.save(setting);

        return mapToResponse(savedSetting);
    }

    public RatingSettingsResponse toggleProductRatings(RatingSettingToggleRequest request) {
        RatingSetting setting = getOrCreateSettings();

        setting.setProductRatingsEnabled(request.getEnabled());

        RatingSetting savedSetting = ratingSettingRepository.save(setting);

        return mapToResponse(savedSetting);
    }

    public RatingSettingsResponse toggleProductComments(RatingSettingToggleRequest request) {
        RatingSetting setting = getOrCreateSettings();

        setting.setProductCommentsEnabled(request.getEnabled());

        RatingSetting savedSetting = ratingSettingRepository.save(setting);

        return mapToResponse(savedSetting);
    }

    public void validateProductRatingAllowed(String comment) {
        RatingSetting setting = getOrCreateSettings();

        if (!Boolean.TRUE.equals(setting.getRatingServiceEnabled())) {
            throw new RatingException("Değerlendirme servisi şu anda kapalı");
        }

        if (!Boolean.TRUE.equals(setting.getProductRatingsEnabled())) {
            throw new RatingException("Ürün değerlendirmeleri şu anda kapalı");
        }

        if (!Boolean.TRUE.equals(setting.getProductCommentsEnabled()) && hasText(comment)) {
            throw new RatingException("Ürün yorumları şu anda kapalı");
        }
    }

    public void validateRestaurantRatingAllowed(String comment) {
        RatingSetting setting = getOrCreateSettings();

        if (!Boolean.TRUE.equals(setting.getRatingServiceEnabled())) {
            throw new RatingException("Değerlendirme servisi şu anda kapalı");
        }

        if (!Boolean.TRUE.equals(setting.getRestaurantRatingsEnabled())) {
            throw new RatingException("Restoran değerlendirmeleri şu anda kapalı");
        }

        if (!Boolean.TRUE.equals(setting.getRestaurantCommentsEnabled()) && hasText(comment)) {
            throw new RatingException("Restoran yorumları şu anda kapalı");
        }
    }

    private RatingSetting getOrCreateSettings() {
        return ratingSettingRepository.findAll()
                .stream()
                .findFirst()
                .orElseGet(() -> ratingSettingRepository.save(
                        RatingSetting.builder()
                                .ratingServiceEnabled(true)
                                .restaurantRatingsEnabled(true)
                                .restaurantCommentsEnabled(true)
                                .productRatingsEnabled(true)
                                .productCommentsEnabled(true)
                                .build()
                ));
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private RatingSettingsResponse mapToResponse(RatingSetting setting) {
        return RatingSettingsResponse.builder()
                .id(setting.getId())
                .ratingServiceEnabled(setting.getRatingServiceEnabled())
                .restaurantRatingsEnabled(setting.getRestaurantRatingsEnabled())
                .restaurantCommentsEnabled(setting.getRestaurantCommentsEnabled())
                .productRatingsEnabled(setting.getProductRatingsEnabled())
                .productCommentsEnabled(setting.getProductCommentsEnabled())
                .createdAt(setting.getCreatedAt())
                .updatedAt(setting.getUpdatedAt())
                .build();
    }
}