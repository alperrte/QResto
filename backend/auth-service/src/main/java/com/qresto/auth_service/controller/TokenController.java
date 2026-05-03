package com.qresto.auth_service.controller;

import com.qresto.auth_service.dto.request.RefreshTokenRequest;
import com.qresto.auth_service.dto.response.AuthResponse;
import com.qresto.auth_service.dto.response.TokenResponse;
import com.qresto.auth_service.service.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth/token")
@RequiredArgsConstructor
public class TokenController {

    private final TokenService tokenService;

    @PostMapping("/refresh")
    public TokenResponse refresh(@RequestBody RefreshTokenRequest request) {
        return tokenService.refresh(request.getRefreshToken());
    }
}
