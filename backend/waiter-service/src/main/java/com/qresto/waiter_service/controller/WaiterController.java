package com.qresto.waiter_service.controller;

import com.qresto.waiter_service.dto.request.CreateTableCallRequest;
import com.qresto.waiter_service.dto.request.ResolveTableCallRequest;
import com.qresto.waiter_service.dto.response.TableCallResponse;
import com.qresto.waiter_service.service.WaiterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.qresto.waiter_service.dto.response.QrTableResponse;
import com.qresto.waiter_service.dto.response.KitchenOrderResponse;
import com.qresto.waiter_service.dto.response.QrValidationResponse;
import com.qresto.waiter_service.dto.response.TableQrCodeResponse;
import com.qresto.waiter_service.dto.response.OrderDetailResponse;
import com.qresto.waiter_service.dto.response.TableSessionResponse;

import java.util.List;

@RestController
@RequestMapping("/waiter")
@RequiredArgsConstructor
public class WaiterController {

    private final WaiterService waiterService;

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Waiter-service is running");
    }

    @PostMapping("/calls")
    public ResponseEntity<TableCallResponse> createTableCall(
            @Valid @RequestBody CreateTableCallRequest request
    ) {
        return ResponseEntity.ok(waiterService.createTableCall(request));
    }

    @GetMapping("/calls")
    public ResponseEntity<List<TableCallResponse>> getAllTableCalls() {
        return ResponseEntity.ok(waiterService.getAllTableCalls());
    }

    @GetMapping("/calls/active")
    public ResponseEntity<List<TableCallResponse>> getActiveTableCalls() {
        return ResponseEntity.ok(waiterService.getActiveTableCalls());
    }

    @GetMapping("/calls/table/{tableId}")
    public ResponseEntity<List<TableCallResponse>> getTableCallsByTableId(
            @PathVariable Long tableId
    ) {
        return ResponseEntity.ok(waiterService.getTableCallsByTableId(tableId));
    }

    @GetMapping("/calls/table/{tableId}/active")
    public ResponseEntity<List<TableCallResponse>> getActiveTableCallsByTableId(
            @PathVariable Long tableId
    ) {
        return ResponseEntity.ok(waiterService.getActiveTableCallsByTableId(tableId));
    }

    @PatchMapping("/calls/{callId}/resolve")
    public ResponseEntity<TableCallResponse> resolveTableCall(
            @PathVariable Long callId,
            @RequestBody ResolveTableCallRequest request
    ) {
        return ResponseEntity.ok(waiterService.resolveTableCall(callId, request));
    }

    @DeleteMapping("/calls/{callId}")
    public ResponseEntity<String> deleteTableCall(
            @PathVariable Long callId
    ) {
        waiterService.deleteTableCall(callId);
        return ResponseEntity.ok("Çağrı silindi");
    }
    @GetMapping("/tables")
    public ResponseEntity<List<QrTableResponse>> getAllTables(
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getAllTables(authHeader));
    }

    @GetMapping("/tables/{tableId}")
    public ResponseEntity<QrTableResponse> getTableDetail(
            @PathVariable Long tableId,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getTableDetail(tableId, authHeader));
    }



    @GetMapping("/orders/ready")
    public ResponseEntity<List<KitchenOrderResponse>> getReadyOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getReadyOrders(authHeader));
    }

    @GetMapping("/orders/cancelled")
    public ResponseEntity<List<KitchenOrderResponse>> getCancelledOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getCancelledOrders(authHeader));
    }

    @PatchMapping("/orders/{orderId}/served")
    public ResponseEntity<String> markOrderServed(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        waiterService.markOrderServed(orderId, authHeader);
        return ResponseEntity.ok("Sipariş servis edildi olarak işaretlendi");
    }
    @GetMapping("/qr/validate")
    public ResponseEntity<QrValidationResponse> validateQr(
            @RequestParam String token,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.validateQr(token, authHeader));
    }

    @GetMapping("/tables/{tableId}/qr-code/active")
    public ResponseEntity<TableQrCodeResponse> getActiveQrCodeByTableId(
            @PathVariable Long tableId,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getActiveQrCodeByTableId(tableId, authHeader));
    }

    @PostMapping("/internal/orders/event")
    public ResponseEntity<String> publishOrderEvent(
            @RequestBody KitchenOrderResponse event
    ) {
        waiterService.publishOrderEvent(event);
        return ResponseEntity.ok("ok");
    }
    @GetMapping("/orders/{orderId}/detail")
    public ResponseEntity<OrderDetailResponse> getOrderDetail(
            @PathVariable Long orderId,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getOrderDetail(orderId, authHeader));
    }

    @GetMapping("/orders/active")
    public ResponseEntity<List<KitchenOrderResponse>> getActiveOrders(
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.getActiveOrders(authHeader));
    }
    @GetMapping("/tables/{tableId}/session/refresh")
    public ResponseEntity<TableSessionResponse> refreshTableSession(
            @PathVariable Long tableId,
            @RequestHeader("Authorization") String authHeader
    ) {
        TableSessionResponse session = waiterService.refreshTableSession(tableId, authHeader);

        if (session == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(session);
    }

    @PatchMapping("/table-sessions/{tableSessionId}/close-by-waiter")
    public ResponseEntity<String> closeTableSessionByWaiter(
            @PathVariable Long tableSessionId,
            @RequestHeader("Authorization") String authHeader
    ) {
        waiterService.closeTableSessionByWaiter(tableSessionId, authHeader);
        return ResponseEntity.ok("Masa oturumu garson tarafından kapatıldı");
    }



    @PatchMapping("/calls/{callId}/mark-paid")
    public ResponseEntity<TableCallResponse> markBillPaid(
            @PathVariable Long callId,
            @RequestBody ResolveTableCallRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        return ResponseEntity.ok(waiterService.markBillPaid(callId, request, authHeader));
    }
}