package com.qresto.waiter_service.service;

import com.qresto.waiter_service.client.KitchenClient;
import com.qresto.waiter_service.client.QrClient;
import com.qresto.waiter_service.dto.request.CreateTableCallRequest;
import com.qresto.waiter_service.dto.request.ResolveTableCallRequest;
import com.qresto.waiter_service.dto.response.KitchenOrderResponse;
import com.qresto.waiter_service.dto.response.QrTableResponse;
import com.qresto.waiter_service.dto.response.TableCallResponse;
import com.qresto.waiter_service.entity.TableCall;
import com.qresto.waiter_service.enums.TableCallStatus;
import com.qresto.waiter_service.repository.TableCallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.qresto.waiter_service.dto.response.QrValidationResponse;
import com.qresto.waiter_service.dto.response.TableQrCodeResponse;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
public class WaiterService {

    private final TableCallRepository tableCallRepository;
    private final QrClient qrClient;
    private final KitchenClient kitchenClient;
    private final SimpMessagingTemplate messagingTemplate;

    public TableCallResponse createTableCall(CreateTableCallRequest request) {

        TableCall tableCall = TableCall.builder()
                .tableId(request.getTableId())
                .tableNumber(request.getTableNumber())
                .callType(request.getCallType())
                .status(TableCallStatus.ACTIVE)
                .message(request.getMessage())
                .createdAt(LocalDateTime.now())
                .isDeleted(false)
                .build();

        TableCall savedTableCall = tableCallRepository.save(tableCall);

        TableCallResponse response = mapToResponse(savedTableCall);

        try {
            messagingTemplate.convertAndSend("/topic/waiter/calls", response);
        } catch (Exception ignored) {
        }

        return response;
    }

    public List<TableCallResponse> getAllTableCalls() {
        return tableCallRepository.findByIsDeletedFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TableCallResponse> getActiveTableCalls() {
        return tableCallRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(TableCallStatus.ACTIVE)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TableCallResponse> getTableCallsByTableId(Long tableId) {
        return tableCallRepository.findByTableIdAndIsDeletedFalseOrderByCreatedAtDesc(tableId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<TableCallResponse> getActiveTableCallsByTableId(Long tableId) {
        return tableCallRepository.findByTableIdAndStatusAndIsDeletedFalseOrderByCreatedAtDesc(
                        tableId,
                        TableCallStatus.ACTIVE
                )
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TableCallResponse resolveTableCall(Long callId, ResolveTableCallRequest request) {

        TableCall tableCall = tableCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Çağrı bulunamadı"));

        if (Boolean.TRUE.equals(tableCall.getIsDeleted())) {
            throw new RuntimeException("Çağrı silinmiş");
        }

        if (tableCall.getStatus() == TableCallStatus.RESOLVED) {
            throw new RuntimeException("Çağrı zaten çözüldü");
        }

        tableCall.setStatus(TableCallStatus.RESOLVED);
        tableCall.setResolvedAt(LocalDateTime.now());
        tableCall.setResolvedBy(request.getResolvedBy());

        TableCall savedTableCall = tableCallRepository.save(tableCall);

        TableCallResponse response = mapToResponse(savedTableCall);

        try {
            messagingTemplate.convertAndSend("/topic/waiter/calls", response);
        } catch (Exception ignored) {
        }

        return response;
    }

    public void publishOrderEvent(KitchenOrderResponse event) {
        try {
            messagingTemplate.convertAndSend("/topic/waiter/orders", event);
        } catch (Exception ignored) {
        }
    }

    public void deleteTableCall(Long callId) {

        TableCall tableCall = tableCallRepository.findById(callId)
                .orElseThrow(() -> new RuntimeException("Çağrı bulunamadı"));

        tableCall.setIsDeleted(true);
        tableCallRepository.save(tableCall);
    }

    private TableCallResponse mapToResponse(TableCall tableCall) {

        return TableCallResponse.builder()
                .id(tableCall.getId())
                .tableId(tableCall.getTableId())
                .tableNumber(tableCall.getTableNumber())
                .callType(tableCall.getCallType())
                .status(tableCall.getStatus())
                .message(tableCall.getMessage())
                .createdAt(tableCall.getCreatedAt())
                .resolvedAt(tableCall.getResolvedAt())
                .resolvedBy(tableCall.getResolvedBy())
                .build();
    }
    public List<QrTableResponse> getAllTables(String authHeader) {
        String token = extractToken(authHeader);
        return qrClient.getAllTables(token);
    }

    public QrTableResponse getTableDetail(Long tableId, String authHeader) {
        String token = extractToken(authHeader);
        return qrClient.getTableDetail(tableId, token);
    }



    public List<KitchenOrderResponse> getReadyOrders(String authHeader) {
        String token = extractToken(authHeader);
        return kitchenClient.getReadyOrders(token);
    }

    public List<KitchenOrderResponse> getCancelledOrders(String authHeader) {
        String token = extractToken(authHeader);
        return kitchenClient.getCancelledOrders(token);
    }

    public void markOrderServed(Long orderId, String authHeader) {
        String token = extractToken(authHeader);
        kitchenClient.markOrderServed(orderId, token);
    }

    private String extractToken(String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Authorization token bulunamadı");
        }

        return authHeader.substring(7);
    }
    public QrValidationResponse validateQr(String qrToken, String authHeader) {
        String token = extractToken(authHeader);
        return qrClient.validateQr(qrToken, token);
    }

    public TableQrCodeResponse getActiveQrCodeByTableId(Long tableId, String authHeader) {
        String token = extractToken(authHeader);
        return qrClient.getActiveQrCodeByTableId(tableId, token);
    }
}