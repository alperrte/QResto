package com.qresto.order_service.service;

import com.qresto.order_service.client.MenuServiceClient;
import com.qresto.order_service.client.QrServiceClient;
import com.qresto.order_service.dto.client.MenuProductOrderInfoResponse;
import com.qresto.order_service.dto.client.QrOrderContextResponse;
import com.qresto.order_service.dto.request.DemoPaymentRequest;
import com.qresto.order_service.dto.request.OrderCancelRequest;
import com.qresto.order_service.dto.request.OrderStatusUpdateRequest;
import com.qresto.order_service.dto.response.OrderAdminSummaryResponse;
import com.qresto.order_service.dto.response.OrderItemResponse;
import com.qresto.order_service.dto.response.OrderResponse;
import com.qresto.order_service.entity.Cart;
import com.qresto.order_service.entity.CartItem;
import com.qresto.order_service.entity.CustomerOrder;
import com.qresto.order_service.entity.OrderItem;
import com.qresto.order_service.entity.enums.CartStatus;
import com.qresto.order_service.entity.enums.OrderItemStatus;
import com.qresto.order_service.entity.enums.OrderStatus;
import com.qresto.order_service.repository.CartRepository;
import com.qresto.order_service.repository.CustomerOrderRepository;
import com.qresto.order_service.repository.OrderItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final CartRepository cartRepository;
    private final CustomerOrderRepository customerOrderRepository;
    private final QrServiceClient qrServiceClient;
    private final MenuServiceClient menuServiceClient;

    @Value("${waiter.service.url:http://localhost:7074}")
    private String waiterServiceUrl;

    public OrderResponse createOrderFromCart(Long cartId) {
        Cart cart = cartRepository.findById(cartId)
                .orElseThrow(() -> new IllegalArgumentException("Cart not found: " + cartId));

        if (cart.getStatus() != CartStatus.ACTIVE) {
            throw new IllegalArgumentException("Only active carts can be converted to order");
        }

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        QrOrderContextResponse qrContext = qrServiceClient.getOrderContext(
                cart.getTableSessionId(),
                cart.getGuestSessionId()
        );

        if (!Boolean.TRUE.equals(qrContext.getOrderAllowed())) {
            throw new IllegalArgumentException("Order is not allowed for this table session");
        }

        BigDecimal subtotalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        CustomerOrder order = new CustomerOrder();
        order.setOrderNo(generateOrderNo());
        order.setCart(cart);
        order.setTableSessionId(cart.getTableSessionId());
        order.setGuestSessionId(cart.getGuestSessionId());
        order.setTableId(cart.getTableId());
        order.setTableName(cart.getTableName());
        order.setStatus(OrderStatus.RECEIVED);
        order.setVatAmount(BigDecimal.ZERO);

        for (CartItem cartItem : cart.getItems()) {
            MenuProductOrderInfoResponse productInfo =
                    menuServiceClient.getProductOrderInfo(cartItem.getProductId());

            if (!Boolean.TRUE.equals(productInfo.getActive()) || !Boolean.TRUE.equals(productInfo.getInStock())) {
                throw new IllegalArgumentException("Product is not available: " + cartItem.getProductId());
            }

            BigDecimal currentPrice = productInfo.getPrice();
            BigDecimal lineTotal = currentPrice.multiply(BigDecimal.valueOf(cartItem.getQuantity()));

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(productInfo.getId());
            orderItem.setProductName(productInfo.getName());
            orderItem.setProductImageUrl(productInfo.getImageUrl());
            orderItem.setProductPrice(currentPrice);
            orderItem.setVatIncluded(productInfo.getVatIncluded());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setRemovedIngredients(cartItem.getRemovedIngredients());
            orderItem.setAddedIngredients(cartItem.getAddedIngredients());
            orderItem.setNote(cartItem.getNote());
            orderItem.setLineTotal(lineTotal);
            orderItem.setStatus(OrderItemStatus.ACTIVE);

            orderItems.add(orderItem);
            subtotalAmount = subtotalAmount.add(lineTotal);
        }

        order.setSubtotalAmount(subtotalAmount);
        order.setTotalAmount(subtotalAmount);
        order.setItems(orderItems);

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        // notify waiter-service so waiter UI can receive the new order in real-time
        try {
            sendOrderEvent(savedOrder);
        } catch (Exception ignored) {
        }

        cart.setStatus(CartStatus.ORDERED);
        cart.setOrderedAt(LocalDateTime.now());
        cart.setSubtotalAmount(subtotalAmount);
        cart.setTotalAmount(subtotalAmount);
        cartRepository.save(cart);

        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNo(String orderNo) {
        CustomerOrder order = customerOrderRepository.findByOrderNo(orderNo)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderNo));

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByTableSession(Long tableSessionId) {
        return customerOrderRepository.findByTableSessionId(tableSessionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrdersByTableSession(Long tableSessionId) {
        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.SERVED,
                OrderStatus.PAYMENT_PENDING
        );

        return customerOrderRepository.findByTableSessionIdAndStatusIn(tableSessionId, activeStatuses)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public OrderResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled order status cannot be changed");
        }

        order.setStatus(request.getStatus());
        setStatusTimestamp(order, request.getStatus());

        CustomerOrder saved = customerOrderRepository.save(order);
        try {
            sendOrderEvent(saved);
        } catch (Exception ignored) {
        }
        return toResponse(saved);
    }

    public OrderResponse cancelOrder(Long orderId, OrderCancelRequest request) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.COMPLETED) {
            throw new IllegalArgumentException("Paid or completed order cannot be cancelled");
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(request.getCancelReason());
        order.setCancelledAt(LocalDateTime.now());

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setStatus(OrderItemStatus.CANCELLED);
                item.setCancelReason(request.getCancelReason());
                item.setCancelledAt(LocalDateTime.now());
            }
        }

        CustomerOrder saved = customerOrderRepository.save(order);
        try {
            sendOrderEvent(saved);
        } catch (Exception ignored) {
        }
        return toResponse(saved);
    }

    private void setStatusTimestamp(CustomerOrder order, OrderStatus status) {
        LocalDateTime now = LocalDateTime.now();

        switch (status) {
            case RECEIVED -> {
                if (order.getReceivedAt() == null) {
                    order.setReceivedAt(now);
                }
            }
            case PREPARING -> order.setPreparingAt(now);
            case READY -> order.setReadyAt(now);
            case SERVED -> order.setServedAt(now);
            case COMPLETED -> order.setCompletedAt(now);
            case PAYMENT_PENDING -> order.setPaymentPendingAt(now);
            case PAID -> order.setPaidAt(now);
            case CANCELLED -> order.setCancelledAt(now);
        }
    }

    private String generateOrderNo() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 9999);

        return "QR-" + datePart + "-" + randomPart;
    }

    private OrderResponse toResponse(CustomerOrder order) {
        OrderResponse response = new OrderResponse();

        response.setId(order.getId());
        response.setOrderNo(order.getOrderNo());
        response.setCartId(order.getCart() != null ? order.getCart().getId() : null);
        response.setTableSessionId(order.getTableSessionId());
        response.setGuestSessionId(order.getGuestSessionId());
        response.setTableId(order.getTableId());
        response.setTableName(order.getTableName());
        response.setStatus(order.getStatus().name());
        response.setSubtotalAmount(order.getSubtotalAmount());
        response.setVatAmount(order.getVatAmount());
        response.setTotalAmount(order.getTotalAmount());
        response.setCancelReason(order.getCancelReason());

        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        response.setReceivedAt(order.getReceivedAt());
        response.setPreparingAt(order.getPreparingAt());
        response.setReadyAt(order.getReadyAt());
        response.setServedAt(order.getServedAt());
        response.setCompletedAt(order.getCompletedAt());
        response.setPaymentPendingAt(order.getPaymentPendingAt());
        response.setPaidAt(order.getPaidAt());
        response.setCancelledAt(order.getCancelledAt());

        List<OrderItem> items = order.getItems() == null
                ? List.of()
                : order.getItems();

        response.setItems(items.stream()
                .map(this::toItemResponse)
                .toList());

        return response;
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();

        response.setId(item.getId());
        response.setProductId(item.getProductId());
        response.setProductName(item.getProductName());
        response.setProductPrice(item.getProductPrice());
        response.setProductImageUrl(item.getProductImageUrl());
        response.setVatIncluded(item.getVatIncluded());
        response.setQuantity(item.getQuantity());
        response.setRemovedIngredients(item.getRemovedIngredients());
        response.setAddedIngredients(item.getAddedIngredients());
        response.setNote(item.getNote());
        response.setLineTotal(item.getLineTotal());
        response.setStatus(item.getStatus().name());
        response.setCancelReason(item.getCancelReason());
        response.setCancelledAt(item.getCancelledAt());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());

        return response;
    }

    private void sendOrderEvent(CustomerOrder order) {
        try {
            RestTemplate rest = new RestTemplate();
            String url = waiterServiceUrl + "/waiter/internal/orders/event";

            Map<String, Object> payload = new HashMap<>();
            payload.put("orderId", order.getId());
            payload.put("tableId", order.getTableId());
            payload.put("tableNumber", null);
            payload.put("orderNumber", order.getOrderNo());
            payload.put("status", order.getStatus().name());
            payload.put("totalAmount", order.getTotalAmount());
            payload.put("createdAt", order.getCreatedAt());
            payload.put("updatedAt", order.getUpdatedAt());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            rest.postForEntity(url, entity, Void.class);
        } catch (Exception ignored) {
        }
    }

    /* Fake Payment Demo */
    public OrderResponse demoPayment(Long orderId, DemoPaymentRequest request) {
        CustomerOrder order = customerOrderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Sipariş bulunamadı: " + orderId));

        if (!order.getGuestSessionId().equals(request.getGuestSessionId())) {
            throw new IllegalArgumentException("Bu sipariş bu kullanıcı oturumuna ait değil");
        }

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalArgumentException("İptal edilmiş sipariş ödenemez");
        }

        if (order.getStatus() == OrderStatus.PAID) {
            throw new IllegalArgumentException("Bu sipariş zaten ödenmiş");
        }

        order.setStatus(OrderStatus.PAID);
        order.setPaidAt(LocalDateTime.now());

        CustomerOrder savedOrder = customerOrderRepository.save(order);

        try {
            sendOrderEvent(savedOrder);
        } catch (Exception ignored) {
        }

        return toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAdminActiveOrders() {
        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.SERVED,
                OrderStatus.PAYMENT_PENDING
        );

        return customerOrderRepository.findByStatusIn(activeStatuses)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAdminCompletedOrders() {
        List<OrderStatus> completedStatuses = List.of(
                OrderStatus.PAID,
                OrderStatus.COMPLETED
        );

        return customerOrderRepository.findByStatusIn(completedStatuses)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAdminCancelledOrders() {
        return customerOrderRepository.findByStatus(OrderStatus.CANCELLED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getTodayOrders() {
        LocalDate today = LocalDate.now();

        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        return customerOrderRepository.findByCreatedAtBetween(start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderAdminSummaryResponse getAdminSummary() {
        LocalDate today = LocalDate.now();

        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.plusDays(1).atStartOfDay();

        List<OrderStatus> activeStatuses = List.of(
                OrderStatus.RECEIVED,
                OrderStatus.PREPARING,
                OrderStatus.READY,
                OrderStatus.SERVED,
                OrderStatus.PAYMENT_PENDING
        );

        List<OrderStatus> completedStatuses = List.of(
                OrderStatus.PAID,
                OrderStatus.COMPLETED
        );

        List<CustomerOrder> todayOrders = customerOrderRepository.findByCreatedAtBetween(start, end);

        long activeCount = todayOrders.stream()
                .filter(order -> activeStatuses.contains(order.getStatus()))
                .count();

        long completedCount = todayOrders.stream()
                .filter(order -> completedStatuses.contains(order.getStatus()))
                .count();

        long cancelledCount = todayOrders.stream()
                .filter(order -> order.getStatus() == OrderStatus.CANCELLED)
                .count();

        BigDecimal todayRevenue = todayOrders.stream()
                .filter(order -> completedStatuses.contains(order.getStatus()))
                .map(CustomerOrder::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalCount = todayOrders.size();

        int operationDensity = totalCount == 0
                ? 0
                : Math.min(100, (int) Math.round((activeCount * 100.0) / totalCount));

        OrderAdminSummaryResponse response = new OrderAdminSummaryResponse();
        response.setActiveOrderCount(activeCount);
        response.setCompletedOrderCount(completedCount);
        response.setCancelledOrderCount(cancelledCount);
        response.setTotalOrderCount((long) totalCount);
        response.setTodayRevenue(todayRevenue);
        response.setOperationDensity(operationDensity);

        return response;
    }
}