package com.qresto.kitchen_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_cancel_logs", schema = "kitchen")
@Getter
@Setter
public class KitchenCancelLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "kitchen_order_id", nullable = false)
    private KitchenOrder kitchenOrder;

    @Column(name = "cancel_reason", nullable = false)
    private String cancelReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}