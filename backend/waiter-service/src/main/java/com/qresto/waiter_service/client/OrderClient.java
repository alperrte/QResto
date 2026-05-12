package com.qresto.waiter_service.client;

import com.qresto.waiter_service.dto.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${order.service.url}")
    private String orderServiceUrl;

    public List<OrderResponse> markTableSessionOrdersPaid(Long tableSessionId, String token) {

        return restClientBuilder.build()
                .patch()
                .uri(orderServiceUrl + "/api/order/orders/table-session/{tableSessionId}/mark-paid",
                        tableSessionId)
                .headers(headers -> {
                    if (token != null && !token.isBlank()) {
                        headers.setBearerAuth(token);
                    }
                })
                .retrieve()
                .body(new ParameterizedTypeReference<List<OrderResponse>>() {});
    }
}