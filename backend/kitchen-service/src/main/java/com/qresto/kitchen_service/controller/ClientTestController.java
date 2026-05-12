package com.qresto.kitchen_service.controller;

import com.qresto.kitchen_service.client.MenuClient;
import com.qresto.kitchen_service.client.OrderClient;
import com.qresto.kitchen_service.dto.client.OrderResponse;
import com.qresto.kitchen_service.dto.client.ProductOrderInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/kitchen/client-test")
@RequiredArgsConstructor
public class ClientTestController {

    private final OrderClient orderClient;
    private final MenuClient menuClient;

    @GetMapping("/order/{orderId}")
    public OrderResponse testOrderClient(
            @PathVariable Long orderId
    ) {

        return orderClient.getOrderById(orderId);
    }

    @GetMapping("/product/{productId}")
    public ProductOrderInfoResponse testMenuClient(
            @PathVariable Long productId
    ) {

        return menuClient.getProductById(productId);
    }

}