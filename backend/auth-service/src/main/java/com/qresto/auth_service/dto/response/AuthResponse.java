package com.qresto.auth_service.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private Long userId;
    private String email;
    private String role;
}