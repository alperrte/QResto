package com.qresto.waiter_service.client;

import com.qresto.waiter_service.dto.response.KitchenOrderResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class KitchenClient {

    private final RestTemplate restTemplate;

    @Value("${kitchen.service.url}")
    private String kitchenServiceUrl;

    public List<KitchenOrderResponse> getReadyOrders(String token) {

        try {
            String url = kitchenServiceUrl + "/api/kitchen/orders/ready";

            HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

            ResponseEntity<List<KitchenOrderResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<KitchenOrderResponse>>() {}
            );

            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (RestClientException exception) {
            return Collections.emptyList();
        }
    }

    public List<KitchenOrderResponse> getCancelledOrders(String token) {

        try {
            String url = kitchenServiceUrl + "/api/kitchen/orders/cancelled";

            HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

            ResponseEntity<List<KitchenOrderResponse>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    new ParameterizedTypeReference<List<KitchenOrderResponse>>() {}
            );

            return response.getBody() != null ? response.getBody() : Collections.emptyList();
        } catch (RestClientException exception) {
            return Collections.emptyList();
        }
    }

    public void markOrderServed(Long orderId, String token) {

        String url = kitchenServiceUrl + "/api/kitchen/orders/" + orderId + "/served";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                entity,
                Void.class
        );
    }

    private HttpHeaders createHeaders(String token) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        if (token != null && !token.isBlank()) {
            headers.setBearerAuth(token);
        }

        return headers;
    }
}
