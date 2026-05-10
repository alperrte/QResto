package com.qresto.order_service.controller;

import com.qresto.order_service.client.MenuServiceClient;
import com.qresto.order_service.client.QrServiceClient;
import com.qresto.order_service.dto.client.MenuProductOrderInfoResponse;
import com.qresto.order_service.dto.client.QrOrderContextResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order/client-test")
@RequiredArgsConstructor
public class ClientTestController {

    private final MenuServiceClient menuServiceClient;
    private final QrServiceClient qrServiceClient;

    @GetMapping("/product/{productId}")
    public MenuProductOrderInfoResponse testProduct(@PathVariable Long productId) {
        return menuServiceClient.getProductOrderInfo(productId);
    }

    @GetMapping("/order-context")
    public QrOrderContextResponse testOrderContext(@RequestParam Long tableSessionId,
                                                   @RequestParam Long guestSessionId) {
        return qrServiceClient.getOrderContext(tableSessionId, guestSessionId);
    }
}