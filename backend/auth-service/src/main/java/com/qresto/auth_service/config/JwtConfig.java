package com.qresto.auth_service.config;

import org.springframework.context.annotation.Configuration;

@Configuration
public class JwtConfig {

    public static final String SECRET = "qresto-secret-key-qresto-secret-key";
    public static final long ACCESS_TOKEN_EXP = 1000 * 60 * 15; // 15 dk
    public static final long REFRESH_TOKEN_EXP = 1000 * 60 * 60 * 24 * 7; // 7 gün
}