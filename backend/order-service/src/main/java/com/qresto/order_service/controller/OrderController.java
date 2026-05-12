package com.qresto.order_service.controller;

import com.qresto.order_service.dto.request.DemoPaymentRequest;
import com.qresto.order_service.dto.request.OrderCancelRequest;
import com.qresto.order_service.dto.request.OrderStatusUpdateRequest;
import com.qresto.order_service.dto.response.OrderAdminProductSalesRowResponse;
import com.qresto.order_service.dto.response.OrderAdminSummaryResponse;
import com.qresto.order_service.dto.response.OrderAdminTableHeatmapCellResponse;
import com.qresto.order_service.dto.response.OrderAdminTopProductResponse;
import com.qresto.order_service.dto.response.OrderResponse;
import com.qresto.order_service.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/from-cart/{cartId}")
    public ResponseEntity<OrderResponse> createOrderFromCart(@PathVariable Long cartId) {
        return ResponseEntity.ok(orderService.createOrderFromCart(cartId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @GetMapping("/number/{orderNo}")
    public ResponseEntity<OrderResponse> getOrderByOrderNo(@PathVariable String orderNo) {
        return ResponseEntity.ok(orderService.getOrderByOrderNo(orderNo));
    }

    @GetMapping("/table-session/{tableSessionId}")
    public ResponseEntity<List<OrderResponse>> getOrdersByTableSession(@PathVariable Long tableSessionId) {
        return ResponseEntity.ok(orderService.getOrdersByTableSession(tableSessionId));
    }

    @GetMapping("/table-session/{tableSessionId}/active")
    public ResponseEntity<List<OrderResponse>> getActiveOrdersByTableSession(@PathVariable Long tableSessionId) {
        return ResponseEntity.ok(orderService.getActiveOrdersByTableSession(tableSessionId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(@PathVariable Long orderId,
                                                           @Valid @RequestBody OrderStatusUpdateRequest request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    @PatchMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(@PathVariable Long orderId,
                                                     @Valid @RequestBody OrderCancelRequest request) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId, request));
    }

    @PatchMapping("/{orderId}/demo-payment")
    public ResponseEntity<OrderResponse> demoPayment(@PathVariable Long orderId,
                                                     @Valid @RequestBody DemoPaymentRequest request) {
        return ResponseEntity.ok(orderService.demoPayment(orderId, request));
    }

    @GetMapping("/admin/active")
    public ResponseEntity<List<OrderResponse>> getAdminActiveOrders() {
        return ResponseEntity.ok(orderService.getAdminActiveOrders());
    }

    @GetMapping("/admin/completed")
    public ResponseEntity<List<OrderResponse>> getAdminCompletedOrders() {
        return ResponseEntity.ok(orderService.getAdminCompletedOrders());
    }

    @GetMapping("/admin/cancelled")
    public ResponseEntity<List<OrderResponse>> getAdminCancelledOrders() {
        return ResponseEntity.ok(orderService.getAdminCancelledOrders());
    }

    @GetMapping("/admin/today")
    public ResponseEntity<List<OrderResponse>> getTodayOrders() {
        return ResponseEntity.ok(orderService.getTodayOrders());
    }

    @GetMapping("/admin/summary")
    public ResponseEntity<OrderAdminSummaryResponse> getAdminSummary() {
        return ResponseEntity.ok(orderService.getAdminSummary());
    }

    @GetMapping("/admin/top-products-today")
    public ResponseEntity<List<OrderAdminTopProductResponse>> getAdminTopProductsToday(
            @RequestParam(name = "limit", defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(orderService.getAdminTopProductsToday(limit));
    }

    @GetMapping("/admin/product-sales-today")
    public ResponseEntity<List<OrderAdminProductSalesRowResponse>> getAdminProductSalesToday(
            @RequestParam(name = "limit", defaultValue = "50") int limit
    ) {
        return ResponseEntity.ok(orderService.getAdminProductSalesToday(limit));
    }

    @GetMapping("/admin/table-heatmap-today")
    public ResponseEntity<List<OrderAdminTableHeatmapCellResponse>> getAdminTableHeatmapToday(
            @RequestParam(name = "limit", defaultValue = "12") int limit
    ) {
        return ResponseEntity.ok(orderService.getAdminTableHeatmapToday(limit));
    }

    @PatchMapping("/table-session/{tableSessionId}/mark-paid")
    public ResponseEntity<List<OrderResponse>> markTableSessionOrdersPaid(@PathVariable Long tableSessionId) {
        return ResponseEntity.ok(orderService.markTableSessionOrdersPaid(tableSessionId));
    }

}