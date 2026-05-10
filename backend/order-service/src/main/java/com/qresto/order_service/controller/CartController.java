package com.qresto.order_service.controller;

import com.qresto.order_service.dto.request.CartCreateRequest;
import com.qresto.order_service.dto.request.CartItemCreateRequest;
import com.qresto.order_service.dto.request.CartItemQuantityUpdateRequest;
import com.qresto.order_service.dto.response.CartResponse;
import com.qresto.order_service.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/order/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @PostMapping
    public ResponseEntity<CartResponse> createCart(@Valid @RequestBody CartCreateRequest request) {
        return ResponseEntity.ok(cartService.createCart(request));
    }

    @PostMapping("/{cartId}/items")
    public ResponseEntity<CartResponse> addItem(@PathVariable Long cartId,
                                                @Valid @RequestBody CartItemCreateRequest request) {
        return ResponseEntity.ok(cartService.addItem(cartId, request));
    }

    @GetMapping("/{cartId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long cartId) {
        return ResponseEntity.ok(cartService.getCart(cartId));
    }
    @GetMapping("/active")
    public ResponseEntity<CartResponse> getActiveCart(@RequestParam Long tableSessionId,
                                                      @RequestParam Long guestSessionId) {
        return ResponseEntity.ok(cartService.getActiveCart(tableSessionId, guestSessionId));
    }

    @PatchMapping("/{cartId}/items/{itemId}/quantity")
    public ResponseEntity<CartResponse> updateItemQuantity(@PathVariable Long cartId,
                                                           @PathVariable Long itemId,
                                                           @Valid @RequestBody CartItemQuantityUpdateRequest request) {
        return ResponseEntity.ok(cartService.updateItemQuantity(cartId, itemId, request));
    }

    @DeleteMapping("/{cartId}/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(@PathVariable Long cartId,
                                                   @PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(cartId, itemId));
    }

    @DeleteMapping("/{cartId}/clear")
    public ResponseEntity<CartResponse> clearCart(@PathVariable Long cartId) {
        return ResponseEntity.ok(cartService.clearCart(cartId));
    }
}