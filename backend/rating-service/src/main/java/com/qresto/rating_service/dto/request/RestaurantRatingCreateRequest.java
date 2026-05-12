package com.qresto.rating_service.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RestaurantRatingCreateRequest {

    @NotNull(message = "Order id boş olamaz")
    private Long orderId;

    @NotNull(message = "Guest session id boş olamaz")
    private Long guestSessionId;

    @NotNull(message = "Puan boş olamaz")
    @Min(value = 1, message = "Puan en az 1 olabilir")
    @Max(value = 5, message = "Puan en fazla 5 olabilir")
    private Integer rating;

    @Size(max = 1000, message = "Yorum en fazla 1000 karakter olabilir")
    private String comment;
}