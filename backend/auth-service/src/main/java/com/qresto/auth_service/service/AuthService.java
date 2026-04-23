package com.qresto.auth_service.service;

import org.springframework.transaction.annotation.Transactional;
import com.qresto.auth_service.dto.response.AuthResponse;
import com.qresto.auth_service.entity.Role;
import com.qresto.auth_service.entity.User;
import com.qresto.auth_service.entity.RefreshToken;
import com.qresto.auth_service.repository.UserRepository;
import com.qresto.auth_service.repository.RefreshTokenRepository;
import com.qresto.auth_service.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Transactional
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    // 🔐 LOGIN
    public AuthResponse login(String email, String password) {

        validateLoginInput(email, password);

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // 🔥 eski tokenları temizle
        refreshTokenRepository.deleteAllByUser(user);

        return generateTokens(user);
    }

    // 🆕 REGISTER
    public AuthResponse register(String email, String password, String role) {

        validateRegisterInput(email, password, role);

        String normalizedEmail = email.trim().toLowerCase();

        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(parseRole(role));

        userRepository.save(user);

        return generateTokens(user);
    }

    // 🔁 TOKEN ÜRETİMİ
    private AuthResponse generateTokens(User user) {

        String accessToken = jwtProvider.generateAccessToken(
                user.getId(),
                user.getRole().name(),
                user.getEmail()
        );

        String refreshToken = jwtProvider.generateRefreshToken(user.getId());

        RefreshToken token = new RefreshToken();
        token.setToken(refreshToken);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusDays(7));
        token.setRevoked(false);

        refreshTokenRepository.save(token);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .role(user.getRole().name())
                .build();
    }

    // 🚪 LOGOUT
    public String logout(String refreshToken) {

        if (refreshToken == null || refreshToken.isBlank()) {
            throw new RuntimeException("Refresh token boş olamaz");
        }

        RefreshToken token = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        // 🔥 ekstra güvenlik
        if (token.isRevoked() || token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Invalid token");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);

        return "Logout successful";
    }

    // 🔐 ŞİFRE DEĞİŞTİR
    public void changePassword(String email, String oldPassword, String newPassword) {

        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Yeni şifre en az 6 karakter olmalı");
        }

        String normalizedEmail = email.trim().toLowerCase();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // 🔥 şifre değişince tüm oturumları düşür
        refreshTokenRepository.deleteAllByUser(user);
    }

    // 🔍 VALIDATION

    private void validateLoginInput(String email, String password) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email boş olamaz");
        }
        if (password == null || password.isBlank()) {
            throw new RuntimeException("Şifre boş olamaz");
        }
    }

    private void validateRegisterInput(String email, String password, String role) {
        if (email == null || email.isBlank()) {
            throw new RuntimeException("Email boş olamaz");
        }
        if (password == null || password.length() < 6) {
            throw new RuntimeException("Şifre en az 6 karakter olmalı");
        }
        if (role == null || role.isBlank()) {
            throw new RuntimeException("Role boş olamaz");
        }
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.trim().toUpperCase());
        } catch (Exception e) {
            throw new RuntimeException("Geçersiz role: " + role);
        }
    }
}