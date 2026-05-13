package com.qresto.kitchen_service.service;

import com.qresto.kitchen_service.client.OrderClient;
import com.qresto.kitchen_service.dto.client.OrderResponse;
import com.qresto.kitchen_service.dto.request.CancelKitchenOrderRequest;
import com.qresto.kitchen_service.dto.request.UpdateKitchenOrderStatusRequest;
import com.qresto.kitchen_service.entity.KitchenOrder;
import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import com.qresto.kitchen_service.repository.KitchenOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class KitchenOrderService {

    private final KitchenOrderRepository kitchenOrderRepository;
    private final OrderClient orderClient;

    public List<OrderResponse> getAllOrders() {
        return orderClient.getActiveOrders();
    }

    public OrderResponse getOrderById(Long orderId) {
        return orderClient.getOrderById(orderId);
    }

    public List<KitchenOrder> getOrdersByStatus(KitchenOrderStatus status) {
        return kitchenOrderRepository.findByStatus(status);
    }

    public OrderResponse updateOrderStatus(
            Long orderId,
            UpdateKitchenOrderStatusRequest request
    ) {
        return orderClient.updateOrderStatus(orderId, request.getStatus());
    }

    public OrderResponse cancelOrder(
            Long orderId,
            CancelKitchenOrderRequest request
    ) {
        return orderClient.cancelOrder(orderId, request.getReason());
    }
}
