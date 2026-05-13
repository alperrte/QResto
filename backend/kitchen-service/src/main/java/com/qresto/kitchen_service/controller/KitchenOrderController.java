package com.qresto.kitchen_service.controller;

import com.qresto.kitchen_service.dto.client.OrderResponse;
import com.qresto.kitchen_service.dto.request.CancelKitchenOrderRequest;
import com.qresto.kitchen_service.dto.request.UpdateKitchenOrderStatusRequest;
import com.qresto.kitchen_service.dto.response.KitchenOrderResponse;
import com.qresto.kitchen_service.entity.KitchenOrder;
import com.qresto.kitchen_service.entity.enums.KitchenOrderStatus;
import com.qresto.kitchen_service.service.KitchenOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/kitchen/orders")
@RequiredArgsConstructor
public class KitchenOrderController {

    private final KitchenOrderService kitchenOrderService;

    @GetMapping
    public List<OrderResponse> getAllOrders() {
        return kitchenOrderService.getAllOrders();
    }

    @GetMapping("/{orderId}")
    public OrderResponse getOrderById(
            @PathVariable Long orderId
    ) {
        return kitchenOrderService.getOrderById(orderId);
    }

    @GetMapping("/status/{status}")
    public List<KitchenOrder> getOrdersByStatus(
            @PathVariable KitchenOrderStatus status
    ) {
        return kitchenOrderService.getOrdersByStatus(status);
    }

    @PatchMapping("/{orderId}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateKitchenOrderStatusRequest request
    ) {
        return kitchenOrderService.updateOrderStatus(orderId, request);
    }

    @GetMapping("/ready")
    public List<KitchenOrderResponse> getReadyOrdersForWaiter() {
        return kitchenOrderService.getReadyOrdersForWaiter();
    }

    @GetMapping("/cancelled")
    public List<KitchenOrderResponse> getCancelledOrdersForWaiter() {
        return kitchenOrderService.getCancelledOrdersForWaiter();
    }

    @PatchMapping("/{orderId}/served")
    public String markOrderServedForWaiter(
            @PathVariable Long orderId
    ) {
        kitchenOrderService.markOrderServedForWaiter(orderId);
        return "Sipariş servis edildi olarak işaretlendi";
    }

    @PatchMapping("/{orderId}/cancel")
    public OrderResponse cancelOrder(
            @PathVariable Long orderId,
            @RequestBody CancelKitchenOrderRequest request
    ) {
        return kitchenOrderService.cancelOrder(orderId, request);
    }
}
