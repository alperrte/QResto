package com.qresto.auth_service.repository;

import com.qresto.auth_service.entity.RefreshToken;
import com.qresto.auth_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);


    void deleteAllByUser(User user);
}