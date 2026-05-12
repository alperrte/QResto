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
import java.util.List;
import java.util.Optional;
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

    // Sepete ürün ekle — aynı ürün ve birebir aynı opsiyon/not ise miktar birleştirilir
    public CartResponse addItem(Long cartId, CartItemCreateRequest request) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));

        if (cart.getStatus() != CartStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot add item to a non-active cart");
        }

        MenuProductOrderInfoResponse productInfo = menuServiceClient.getProductOrderInfo(request.getProductId());

        if (!productInfo.getActive() || !productInfo.getInStock()) {
            throw new IllegalArgumentException("Product is not available");
        }

        Optional<CartItem> mergeTarget = cartItemRepository.findByCartId(cartId).stream()
                .filter(row -> sameCartLine(row, request))
                .findFirst();

        if (mergeTarget.isPresent()) {
            CartItem existing = mergeTarget.get();
            int newQty = existing.getQuantity() + request.getQuantity();
            existing.setQuantity(newQty);
            existing.setLineTotal(
                    existing.getProductPrice().multiply(BigDecimal.valueOf(newQty))
            );
            cartItemRepository.save(existing);
            recalcCartTotals(cartId);
            return toResponse(cartRepository.findById(cartId).orElseThrow());
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

        cartItemRepository.save(item);
        recalcCartTotals(cartId);

        return toResponse(cartRepository.findById(cartId).orElseThrow());
    }

    private static String normalizeOptionField(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim();
    }

    private boolean sameCartLine(CartItem row, CartItemCreateRequest request) {
        return row.getProductId().equals(request.getProductId())
                && normalizeOptionField(row.getRemovedIngredients())
                .equals(normalizeOptionField(request.getRemovedIngredients()))
                && normalizeOptionField(row.getAddedIngredients())
                .equals(normalizeOptionField(request.getAddedIngredients()))
                && normalizeOptionField(row.getNote()).equals(normalizeOptionField(request.getNote()));
    }

    private void recalcCartTotals(Long cartId) {
        List<CartItem> items = cartItemRepository.findByCartId(cartId);
        BigDecimal subtotal = items.stream()
                .map(CartItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));
        cart.setSubtotalAmount(subtotal);
        cart.setTotalAmount(subtotal);
        cartRepository.save(cart);
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

        List<CartItem> itemRows = cartItemRepository.findByCartId(cart.getId());
        response.setItems(itemRows.stream().map(item -> {
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
        findActiveCart(cartId);

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        item.setQuantity(request.getQuantity());
        item.setLineTotal(item.getProductPrice().multiply(BigDecimal.valueOf(request.getQuantity())));

        cartItemRepository.save(item);

        recalcCartTotals(cartId);

        return toResponse(cartRepository.findById(cartId).orElseThrow());
    }
    public CartResponse removeItem(Long cartId, Long itemId) {
        findActiveCart(cartId);

        CartItem item = cartItemRepository.findByIdAndCartId(itemId, cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart item not found: " + itemId));

        cartItemRepository.delete(item);

        recalcCartTotals(cartId);

        return toResponse(cartRepository.findById(cartId).orElseThrow());
    }
    public CartResponse clearCart(Long cartId) {
        Cart cart = findActiveCart(cartId);

        cartItemRepository.deleteByCartId(cartId);

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