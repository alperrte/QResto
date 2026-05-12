package com.qresto.rating_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingSettingsUpdateRequest {

    @NotNull(message = "Değerlendirme servisi durumu boş olamaz")
    private Boolean ratingServiceEnabled;

    @NotNull(message = "Restoran değerlendirme durumu boş olamaz")
    private Boolean restaurantRatingsEnabled;

    @NotNull(message = "Restoran yorum durumu boş olamaz")
    private Boolean restaurantCommentsEnabled;

    @NotNull(message = "Ürün değerlendirme durumu boş olamaz")
    private Boolean productRatingsEnabled;

    @NotNull(message = "Ürün yorum durumu boş olamaz")
    private Boolean productCommentsEnabled;
}