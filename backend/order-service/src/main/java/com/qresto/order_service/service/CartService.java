package com.qresto.order_service.service;

import com.qresto.order_service.client.MenuServiceClient;
import com.qresto.order_service.client.QrServiceClient;
import com.qresto.order_service.dto.client.MenuProductOrderInfoResponse;
import com.qresto.order_service.dto.client.QrOrderContextResponse;
import com.qresto.order_service.dto.request.CartCreateRequest;
import com.qresto.order_service.dto.request.CartItemCreateRequest;
import com.qresto.order_service.dto.request.CartItemQuantityUpdateRequest;
import com.qresto.order_service.dto.response.CartResponse;
import com.qresto.order_service.dto.response.CartItemResponse;
import com.qresto.order_service.entity.Cart;
import com.qresto.order_service.entity.CartItem;
import com.qresto.order_service.entity.enums.CartStatus;
import com.qresto.order_service.repository.CartItemRepository;
import com.qresto.order_service.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final QrServiceClient qrServiceClient;
    private final MenuServiceClient menuServiceClient;

    // Yeni sepet oluştur
    public CartResponse createCart(CartCreateRequest request) {
        // QR-Service ile tableSession / guestSession doğrula
        QrOrderContextResponse qrResponse = qrServiceClient.getOrderContext(
                request.getTableSessionId(),
                request.getGuestSessionId()
        );

        if (!qrResponse.getOrderAllowed()) {
            throw new IllegalArgumentException("Order not allowed for this table session");
        }

        Cart cart = new Cart();
        cart.setTableSessionId(request.getTableSessionId());
        cart.setGuestSessionId(request.getGuestSessionId());
        cart.setTableId(request.getTableId());
        cart.setTableName(request.getTableName());
        cart.setStatus(CartStatus.ACTIVE);
        cart.setSubtotalAmount(BigDecimal.ZERO);
        cart.setTotalAmount(BigDecimal.ZERO);

        Cart saved = cartRepository.save(cart);
        return toResponse(saved);
    }

    // Sepete ürün ekle
    public CartResponse addItem(Long cartId, CartItemCreateRequest request) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));

        if (cart.getStatus() != CartStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot add item to a non-active cart");
        }

        // Menu-Service ile ürün doğrula
        MenuProductOrderInfoResponse productInfo = menuServiceClient.getProductOrderInfo(request.getProductId());

        if (!productInfo.getActive() || !productInfo.getInStock()) {
            throw new IllegalArgumentException("Product is not available");
        }

        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProductId(productInfo.getId());
        item.setProductName(productInfo.getName());
        item.setProductPrice(productInfo.getPrice());
        item.setVatIncluded(productInfo.getVatIncluded());
        item.setQuantity(request.getQuantity());
        item.setRemovedIngredients(request.getRemovedIngredients());
        item.setAddedIngredients(request.getAddedIngredients());
        item.setNote(request.getNote());
        item.setLineTotal(productInfo.getPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        cart.getItems().add(item);
        recalcCartTotals(cart);

        cartRepository.save(cart);
        return toResponse(cart);
    }

    // Sepet toplamını hesapla
    private void recalcCartTotals(Cart cart) {
        BigDecimal subtotal = cart.getItems().stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        cart.setSubtotalAmount(subtotal);
        cart.setTotalAmount(subtotal); // Şimdilik vergisiz = subtotal
    }

    // Sepeti döndür
    public CartResponse getCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));

        return toResponse(cart);
    }

    // Entity -> DTO
    private CartResponse toResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        response.setTableSessionId(cart.getTableSessionId());
        response.setGuestSessionId(cart.getGuestSessionId());
        response.setTableId(cart.getTableId());
        response.setTableName(cart.getTableName());
        response.setStatus(cart.getStatus().name());
        response.setSubtotalAmount(cart.getSubtotalAmount());
        response.setTotalAmount(cart.getTotalAmount());
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());
        response.setOrderedAt(cart.getOrderedAt());
        response.setClearedAt(cart.getClearedAt());

        response.setItems(cart.getItems().stream().map(item -> {
            CartItemResponse i = new CartItemResponse();
            i.setId(item.getId());
            i.setProductId(item.getProductId());
            i.setProductName(item.getProductName());
            i.setProductPrice(item.getProductPrice());
            i.setVatIncluded(item.getVatIncluded());
            i.setQuantity(item.getQuantity());
            i.setRemovedIngredients(item.getRemovedIngredients());
            i.setAddedIngredients(item.getAddedIngredients());
            i.setNote(item.getNote());
            i.setLineTotal(item.getLineTotal());
            return i;
        }).collect(Collectors.toList()));

        return response;
    }
    @Transactional(readOnly = true)
    public CartResponse getActiveCart(Long tableSessionId, Long guestSessionId) {
        Cart cart = cartRepository.findByTableSessionIdAndGuestSessionIdAndStatus(
                tableSessionId,
                guestSessionId,
                CartStatus.ACTIVE
        ).orElseThrow(() -> new IllegalArgumentException("Active cart not found"));

        return toResponse(cart);
    }
    public CartResponse updateItemQuantity(Long cartId, Long itemId, CartItemQuantityUpdateRequest request) {
        Cart cart = findActiveCart(cartId);

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        item.setQuantity(request.getQuantity());
        item.setLineTotal(item.getProductPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        cartItemRepository.save(item);

        recalcCartTotals(cart);

        return toResponse(cartRepository.save(cart));
    }
    public CartResponse removeItem(Long cartId, Long itemId) {
        Cart cart = findActiveCart(cartId);

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        cart.getItems().removeIf(cartItem -> cartItem.getId().equals(item.getId()));
        cartItemRepository.delete(item);

        recalcCartTotals(cart);

        return toResponse(cartRepository.save(cart));
    }
    public CartResponse clearCart(Long cartId) {
        Cart cart = findActiveCart(cartId);

        cartItemRepository.deleteByCartId(cartId);

        if (cart.getItems() != null) {
            cart.getItems().clear();
        }

        cart.setSubtotalAmount(BigDecimal.ZERO);
        cart.setTotalAmount(BigDecimal.ZERO);
        cart.setClearedAt(LocalDateTime.now());

        return toResponse(cartRepository.save(cart));
    }
    private Cart findActiveCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));

        if (cart.getStatus() != CartStatus.ACTIVE) {
            throw new IllegalArgumentException("Cart is not active");
        }

        return cart;
    }
}