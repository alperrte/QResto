package com.qresto.auth_service.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class JwtConfig {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access-expiration}")
    private long accessTokenExp;

    @Value("${jwt.refresh-expiration}")
    private long refreshTokenExp;
}