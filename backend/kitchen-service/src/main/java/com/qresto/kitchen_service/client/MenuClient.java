package com.qresto.kitchen_service.client;

import com.qresto.kitchen_service.dto.client.ProductOrderInfoResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class MenuClient {

    private final RestClient restClient;

    @Value("${MENU_SERVICE_URL}")
    private String menuServiceUrl;

    public MenuClient() {

        this.restClient = RestClient.builder().build();
    }

    public ProductOrderInfoResponse getProductById(Long productId) {

        return restClient.get()
                .uri(menuServiceUrl + "/api/menu/products/order-info/" + productId)
                .retrieve()
                .body(ProductOrderInfoResponse.class);
    }

}