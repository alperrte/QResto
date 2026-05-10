package com.qresto.order_service.repository;

import com.qresto.order_service.entity.Cart;
import com.qresto.order_service.entity.enums.CartStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {

    Optional<Cart> findByTableSessionIdAndGuestSessionIdAndStatus(
            Long tableSessionId,
            Long guestSessionId,
            CartStatus status
    );

    List<Cart> findByTableSessionId(Long tableSessionId);

    List<Cart> findByTableSessionIdAndStatus(Long tableSessionId, CartStatus status);

    List<Cart> findByGuestSessionId(Long guestSessionId);
}