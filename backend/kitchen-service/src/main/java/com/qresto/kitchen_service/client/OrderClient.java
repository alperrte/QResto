package com.qresto.kitchen_service.client;

import com.qresto.kitchen_service.dto.client.OrderResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class OrderClient {

    private final RestClient restClient;

    @Value("${ORDER_SERVICE_URL}")
    private String orderServiceUrl;

    public OrderClient() {

        this.restClient = RestClient.builder().build();
    }

    public OrderResponse getOrderById(Long orderId) {

        return restClient.get()
                .uri(orderServiceUrl + "/api/order/orders/" + orderId)
                .retrieve()
                .body(OrderResponse.class);
    }

}