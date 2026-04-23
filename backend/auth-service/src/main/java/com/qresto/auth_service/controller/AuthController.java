package com.qresto.auth_service.controller;

import com.qresto.auth_service.dto.request.LoginRequest;
import com.qresto.auth_service.dto.request.RefreshTokenRequest;
import com.qresto.auth_service.dto.request.RegisterRequest;
import com.qresto.auth_service.dto.response.AuthResponse;
import com.qresto.auth_service.service.AuthService;
import com.qresto.auth_service.service.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @PostMapping("/logout")
    public void logout(@RequestBody RefreshTokenRequest request) {
        authService.logout(request.getRefreshToken());
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(
                request.getEmail(),
                request.getPassword(),
                request.getRole()
        );
    }
}