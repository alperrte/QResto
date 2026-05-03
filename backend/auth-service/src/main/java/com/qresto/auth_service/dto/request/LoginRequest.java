package com.qresto.auth_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email boş olamaz")
    private String email;

    @NotBlank(message = "Şifre boş olamaz")
    private String password;
}