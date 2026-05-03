package com.qresto.auth_service.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDateTime;

@Entity
public class PasswordResetToken {

    @Id
    private Long id;

    private String token;

    @ManyToOne
    private User user;

    private LocalDateTime expiryDate;
}
