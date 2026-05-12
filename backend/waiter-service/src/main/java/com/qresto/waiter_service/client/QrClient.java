package com.qresto.waiter_service.client;

import com.qresto.waiter_service.dto.response.QrTableResponse;
import com.qresto.waiter_service.dto.response.QrValidationResponse;
import com.qresto.waiter_service.dto.response.TableQrCodeResponse;
import com.qresto.waiter_service.dto.response.TableSessionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.List;

@Component
@RequiredArgsConstructor
public class QrClient {

    private final RestTemplate restTemplate;

    @Value("${qr.service.url}")
    private String qrServiceUrl;

    public List<QrTableResponse> getAllTables(String token) {

        String url = qrServiceUrl + "/api/tables";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<List<QrTableResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<List<QrTableResponse>>() {}
        );

        return response.getBody();
    }

    public QrTableResponse getTableDetail(Long tableId, String token) {

        String url = qrServiceUrl + "/api/tables/" + tableId;

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<QrTableResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                QrTableResponse.class
        );

        return response.getBody();
    }

    public QrValidationResponse validateQr(String qrToken, String token) {

        String url = qrServiceUrl + "/api/qr/validate?token=" + qrToken;

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<QrValidationResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                QrValidationResponse.class
        );

        return response.getBody();
    }

    public TableQrCodeResponse getActiveQrCodeByTableId(Long tableId, String token) {

        String url = qrServiceUrl + "/api/qr-codes/table/" + tableId + "/active";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<TableQrCodeResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                TableQrCodeResponse.class
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
    public TableSessionResponse getActiveSessionByTableId(Long tableId, String token) {

        String url = qrServiceUrl + "/api/table-sessions/active/table/" + tableId;

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<TableSessionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                TableSessionResponse.class
        );

        return response.getBody();
    }

    public TableSessionResponse markPaymentPending(Long tableSessionId, String token) {

        String url = qrServiceUrl + "/api/table-sessions/" + tableSessionId + "/payment-pending";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        ResponseEntity<TableSessionResponse> response = restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                entity,
                TableSessionResponse.class
        );

        return response.getBody();
    }
    public void closeSessionByWaiter(Long tableSessionId, String token) {

        String url = qrServiceUrl + "/api/table-sessions/" + tableSessionId + "/close-by-waiter";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                entity,
                Void.class
        );
    }
    public void closeActiveSessionByTableByWaiter(Long tableId, String token) {

        String url = qrServiceUrl + "/api/table-sessions/active/table/" + tableId + "/close-by-waiter";

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders(token));

        restTemplate.exchange(
                url,
                HttpMethod.PATCH,
                entity,
                Void.class
        );
    }
}