package com.qresto.rating_service.client;

import com.qresto.rating_service.dto.client.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class OrderClientService {

    private final RestClient.Builder restClientBuilder;

    @Value("${order.service.url}")
    private String orderServiceUrl;

    public OrderResponse getOrderById(Long orderId) {
        RestClient restClient = restClientBuilder
                .baseUrl(orderServiceUrl)
                .build();

        OrderResponse order = restClient.get()
                .uri("/api/order/orders/{orderId}", orderId)
                .retrieve()
                .body(OrderResponse.class);

        if (order == null) {
            throw new RuntimeException("Sipariş bilgisi alınamadı");
        }

        return order;
    }
}