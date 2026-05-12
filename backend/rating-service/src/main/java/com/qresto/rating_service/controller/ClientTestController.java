package com.qresto.rating_service.controller;

import com.qresto.rating_service.client.OrderClientService;
import com.qresto.rating_service.dto.client.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rating/client-test")
@RequiredArgsConstructor
public class ClientTestController {

    private final OrderClientService orderClientService;

    @GetMapping("/order/{orderId}")
    public OrderResponse testOrderClient(@PathVariable Long orderId) {
        return orderClientService.getOrderById(orderId);
    }
}