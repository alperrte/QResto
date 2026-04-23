package com.qresto.qr_service.entity;

import com.qresto.qr_service.entity.enums.GuestSessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "guest_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuestSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_session_id", nullable = false)
    private TableSession tableSession;

    @Column(name = "guest_code", nullable = false, unique = true, length = 100)
    private String guestCode;

    @Column(name = "device_token", nullable = false, length = 255)
    private String deviceToken;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private GuestSessionStatus status;

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    @Column(name = "last_activity_at", nullable = false)
    private LocalDateTime lastActivityAt;

    @Column(name = "expired_at")
    private LocalDateTime expiredAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @Column(name = "close_reason", length = 100)
    private String closeReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.joinedAt = this.joinedAt == null ? now : this.joinedAt;
        this.lastActivityAt = this.lastActivityAt == null ? now : this.lastActivityAt;
        this.status = this.status == null ? GuestSessionStatus.ACTIVE : this.status;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}