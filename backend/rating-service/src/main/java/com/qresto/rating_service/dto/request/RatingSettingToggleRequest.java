package com.qresto.rating_service.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RatingSettingToggleRequest {

    @NotNull(message = "Aktiflik durumu boş olamaz")
    private Boolean enabled;
}