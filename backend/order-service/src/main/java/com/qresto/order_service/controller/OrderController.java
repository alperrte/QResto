package com.qresto.order_service.controller;

import com.qresto.order_service.dto.request.DemoPaymentRequest;
import com.qresto.order_service.dto.request.OrderCancelRequest;
import com.qresto.order_service.dto.request.OrderStatusUpdateRequest;
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
    @GetMapping("/active")
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        return ResponseEntity.ok(orderService.getActiveOrders());
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

}