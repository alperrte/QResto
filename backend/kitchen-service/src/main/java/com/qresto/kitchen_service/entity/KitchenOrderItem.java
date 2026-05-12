package com.qresto.kitchen_service.entity;

import com.qresto.kitchen_service.entity.enums.KitchenItemStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "kitchen_order_items", schema = "kitchen")
@Getter
@Setter
public class KitchenOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "kitchen_order_id", nullable = false)
    private KitchenOrder kitchenOrder;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(nullable = false)
    private Integer quantity;

    @Column
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KitchenItemStatus status;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

}