package com.qresto.qr_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "table_qr_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableQrCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable restaurantTable;

    @Column(name = "qr_uuid", nullable = false, unique = true)
    private UUID qrUuid;

    @Column(name = "qr_token", nullable = false, unique = true, length = 255)
    private String qrToken;

    @Column(name = "qr_image_url", length = 500)
    private String qrImageUrl;

    @Column(name = "version_no", nullable = false)
    private Integer versionNo = 1;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "tableQrCode", fetch = FetchType.LAZY)
    private List<TableSession> tableSessions;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.active = this.active == null ? true : this.active;
        this.versionNo = this.versionNo == null ? 1 : this.versionNo;
        this.qrUuid = this.qrUuid == null ? UUID.randomUUID() : this.qrUuid;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}