package com.qresto.waiter_service.client;

import com.qresto.waiter_service.dto.response.OrderDetailResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import com.qresto.waiter_service.dto.response.OrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
@RequiredArgsConstructor
public class OrderClient {

    private final RestTemplate restTemplate;
    private final RestClient.Builder restClientBuilder;

    @Value("${order.service.url}")
    private String orderServiceUrl;

    public OrderDetailResponse getOrderDetail(Long orderId, String token) {

        String url = orderServiceUrl + "/api/order/orders/" + orderId;

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<OrderDetailResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                OrderDetailResponse.class
        );

        return response.getBody();
    }

    private HttpHeaders createHeaders(String token) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
        }

        return headers;
    }
    public List<OrderDetailResponse> getActiveOrders(String token) {

        String url = orderServiceUrl + "/api/order/orders/active";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<List<OrderDetailResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<OrderDetailResponse>>() {}
        );

        return response.getBody() != null ? response.getBody() : Collections.emptyList();
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