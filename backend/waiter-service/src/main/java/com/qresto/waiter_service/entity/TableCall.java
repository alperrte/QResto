package com.qresto.waiter_service.entity;

import com.qresto.waiter_service.enums.TableCallStatus;
import com.qresto.waiter_service.enums.TableCallType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "table_calls", schema = "waiter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableCall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @Column(name = "table_number")
    private Integer tableNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "call_type", nullable = false, length = 50)
    private TableCallType callType;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private TableCallStatus status;

    @Column(name = "message", length = 500)
    private String message;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;
}