package com.qresto.auth_service.service;

import com.qresto.auth_service.dto.response.TokenResponse;
import com.qresto.auth_service.entity.RefreshToken;
import com.qresto.auth_service.entity.User;
import com.qresto.auth_service.repository.RefreshTokenRepository;
import com.qresto.auth_service.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;

    public TokenResponse refresh(String refreshToken) {

        // 🔍 Token DB'de var mı
        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        // ❌ revoke + reuse attack
        if (token.isRevoked()) {
            throw new RuntimeException("Refresh token reuse detected");
        }

        // ❌ expiry kontrolü
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired");
        }

        User user = token.getUser();
        Long userId = user.getId();

        // 🔥 ROTATION: eski token'ı iptal et
        token.setRevoked(true);
        refreshTokenRepository.save(token);

        // 🔥 yeni token üret
        String newAccessToken = jwtProvider.generateAccessToken(
                userId,
                user.getRole().name(),
                user.getEmail()
        );

        String newRefreshToken = jwtProvider.generateRefreshToken(userId);

        // 🔥 yeni refresh token DB'ye kaydet
        RefreshToken newToken = new RefreshToken();
        newToken.setToken(newRefreshToken);
        newToken.setUser(user);
        newToken.setExpiryDate(LocalDateTime.now().plusDays(7));
        newToken.setRevoked(false);

        refreshTokenRepository.save(newToken);

        // 🔥 TOKEN RESPONSE (clean)
        return TokenResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }
}