package com.qresto.order_service.client;

import com.qresto.order_service.dto.client.MenuProductOrderInfoResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class MenuServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${menu.service.url}")
    private String menuServiceUrl;

    public MenuProductOrderInfoResponse getProductOrderInfo(Long productId) {
        return restClientBuilder.build()
                .get()
                .uri(menuServiceUrl + "/api/menu/products/{productId}/order-info", productId)
                .retrieve()
                .body(MenuProductOrderInfoResponse.class);
    }
}