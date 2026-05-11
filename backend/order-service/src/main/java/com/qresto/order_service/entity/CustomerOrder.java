package com.qresto.order_service.entity;

import com.qresto.order_service.entity.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "customer_orders", schema = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_no", nullable = false, unique = true, length = 50)
    private String orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @Column(name = "table_session_id", nullable = false)
    private Long tableSessionId;

    @Column(name = "guest_session_id", nullable = false)
    private Long guestSessionId;

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "table_name", length = 100)
    private String tableName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private OrderStatus status;

    @Column(name = "subtotal_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotalAmount;

    @Column(name = "vat_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal vatAmount;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "received_at")
    private LocalDateTime receivedAt;

    @Column(name = "preparing_at")
    private LocalDateTime preparingAt;

    @Column(name = "ready_at")
    private LocalDateTime readyAt;

    @Column(name = "served_at")
    private LocalDateTime servedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "payment_pending_at")
    private LocalDateTime paymentPendingAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();

        this.createdAt = now;

        if (this.status == null) {
            this.status = OrderStatus.RECEIVED;
        }

        if (this.receivedAt == null) {
            this.receivedAt = now;
        }

        if (this.subtotalAmount == null) {
            this.subtotalAmount = BigDecimal.ZERO;
        }

        if (this.vatAmount == null) {
            this.vatAmount = BigDecimal.ZERO;
        }

        if (this.totalAmount == null) {
            this.totalAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}