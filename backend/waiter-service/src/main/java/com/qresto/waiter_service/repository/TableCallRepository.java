package com.qresto.waiter_service.repository;

import com.qresto.waiter_service.entity.TableCall;
import com.qresto.waiter_service.enums.TableCallStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TableCallRepository extends JpaRepository<TableCall, Long> {

    List<TableCall> findByIsDeletedFalseOrderByCreatedAtDesc();

    List<TableCall> findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(TableCallStatus status);

    List<TableCall> findByTableIdAndIsDeletedFalseOrderByCreatedAtDesc(Long tableId);

    List<TableCall> findByTableIdAndStatusAndIsDeletedFalseOrderByCreatedAtDesc(
            Long tableId,
            TableCallStatus status
    );
}