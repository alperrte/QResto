package com.qresto.order_service.client;

import com.qresto.order_service.dto.client.QrOrderContextResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
@RequiredArgsConstructor
public class QrServiceClient {

    private final RestClient.Builder restClientBuilder;

    @Value("${qr.service.url}")
    private String qrServiceUrl;

    public QrOrderContextResponse getOrderContext(Long tableSessionId, Long guestSessionId) {
        return restClientBuilder.build()
                .get()
                .uri(qrServiceUrl + "/api/table-sessions/{tableSessionId}/order-context?guestSessionId={guestSessionId}",
                        tableSessionId,
                        guestSessionId)
                .retrieve()
                .body(QrOrderContextResponse.class);
    }
}