package com.qresto.kitchen_service.controller;

import com.qresto.kitchen_service.dto.request.UpdateKitchenOrderStatusRequest;
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
    public List<KitchenOrder> getAllOrders() {
        return kitchenOrderService.getAllOrders();
    }

    @GetMapping("/status/{status}")
    public List<KitchenOrder> getOrdersByStatus(
            @PathVariable KitchenOrderStatus status
    ) {
        return kitchenOrderService.getOrdersByStatus(status);
    }

    @PatchMapping("/{orderId}/status")
    public KitchenOrder updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateKitchenOrderStatusRequest request
    ) {
        return kitchenOrderService.updateOrderStatus(orderId, request);
    }

}