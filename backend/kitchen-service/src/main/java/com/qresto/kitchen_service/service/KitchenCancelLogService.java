package com.qresto.kitchen_service.service;

import com.qresto.kitchen_service.dto.request.CreateKitchenCancelLogRequest;
import com.qresto.kitchen_service.entity.KitchenCancelLog;
import com.qresto.kitchen_service.entity.KitchenOrder;
import com.qresto.kitchen_service.repository.KitchenCancelLogRepository;
import com.qresto.kitchen_service.repository.KitchenOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.qresto.kitchen_service.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KitchenCancelLogService {

    private final KitchenCancelLogRepository kitchenCancelLogRepository;
    private final KitchenOrderRepository kitchenOrderRepository;

    public List<KitchenCancelLog> getAllLogs() {
        return kitchenCancelLogRepository.findAll();
    }

    public KitchenCancelLog createCancelLog(
            Long kitchenOrderId,
            CreateKitchenCancelLogRequest request
    ) {

        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(kitchenOrderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sipariş bulunamadı")
                );

        KitchenCancelLog kitchenCancelLog = new KitchenCancelLog();

        kitchenCancelLog.setKitchenOrder(kitchenOrder);
        kitchenCancelLog.setCancelReason(request.getCancelReason());
        kitchenCancelLog.setCancelledBy(request.getCancelledBy());
        kitchenCancelLog.setCreatedAt(LocalDateTime.now());

        return kitchenCancelLogRepository.save(kitchenCancelLog);
    }

}