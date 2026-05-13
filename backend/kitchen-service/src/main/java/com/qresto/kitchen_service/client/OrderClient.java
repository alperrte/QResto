package com.qresto.kitchen_service.client;

import com.qresto.kitchen_service.dto.client.OrderResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.net.http.HttpClient;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OrderClient {

    private final RestClient restClient;

    @Value("${ORDER_SERVICE_URL:http://localhost:7075}")
    private String orderServiceUrl;

    public OrderClient() {
        this.restClient = RestClient.builder()
                .requestFactory(new JdkClientHttpRequestFactory(HttpClient.newHttpClient()))
                .build();
    }

    public List<OrderResponse> getActiveOrders() {

        String url = orderServiceUrl + "/api/order/orders/admin/active";

        log.info("Kitchen-service order-service aktif siparişleri çekiyor: {}", url);

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<List<OrderResponse>>() {});
    }

    public List<OrderResponse> getTodayOrders() {

        String url = orderServiceUrl + "/api/order/orders/admin/today";

        log.info("Kitchen-service order-service bugünkü siparişleri çekiyor: {}", url);

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(new ParameterizedTypeReference<List<OrderResponse>>() {});
    }

    public OrderResponse getOrderById(Long orderId) {

        String url = orderServiceUrl + "/api/order/orders/" + orderId;

        log.info("Kitchen-service order-service sipariş detayı çekiyor: {}", url);

        return restClient.get()
                .uri(url)
                .retrieve()
                .body(OrderResponse.class);
    }

    public OrderResponse updateOrderStatus(Long orderId, String status) {

        String url = orderServiceUrl + "/api/order/orders/" + orderId + "/status";

        log.info("Kitchen-service order-service sipariş durumu güncelliyor: {} -> {}", url, status);

        return restClient.patch()
                .uri(url)
                .body(Map.of("status", status))
                .retrieve()
                .body(OrderResponse.class);
    }

    public OrderResponse cancelOrder(Long orderId, String reason) {

        String url = orderServiceUrl + "/api/order/orders/" + orderId + "/cancel";

        log.info("Kitchen-service order-service sipariş iptal ediyor: {}", url);

        return restClient.patch()
                .uri(url)
                .body(Map.of("cancelReason", reason))
                .retrieve()
                .body(OrderResponse.class);
    }
}
