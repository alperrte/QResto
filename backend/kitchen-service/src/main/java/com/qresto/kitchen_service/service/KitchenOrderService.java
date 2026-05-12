package com.qresto.kitchen_service.service;

import com.qresto.kitchen_service.dto.request.UpdateKitchenOrderStatusRequest;
import com.qresto.kitchen_service.entity.KitchenOrder;
import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import com.qresto.kitchen_service.repository.KitchenOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.qresto.kitchen_service.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class KitchenOrderService {

    private final KitchenOrderRepository kitchenOrderRepository;

    public List<KitchenOrder> getAllOrders() {
        return kitchenOrderRepository.findAll();
    }

    public List<KitchenOrder> getOrdersByStatus(KitchenOrderStatus status) {
        return kitchenOrderRepository.findByStatus(status);
    }

    public KitchenOrder updateOrderStatus(
            Long orderId,
            UpdateKitchenOrderStatusRequest request
    ) {

        KitchenOrder kitchenOrder = kitchenOrderRepository.findById(orderId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Sipariş bulunamadı")
                );

        kitchenOrder.setStatus(request.getStatus());
        kitchenOrder.setUpdatedAt(LocalDateTime.now());

        return kitchenOrderRepository.save(kitchenOrder);
    }

}