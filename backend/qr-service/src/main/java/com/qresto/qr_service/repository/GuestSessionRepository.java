package com.qresto.qr_service.repository;

import com.qresto.qr_service.entity.GuestSession;
import com.qresto.qr_service.entity.enums.GuestSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GuestSessionRepository extends JpaRepository<GuestSession, Long> {

    Optional<GuestSession> findByGuestCode(String guestCode);

    Optional<GuestSession> findByTableSessionIdAndDeviceToken(Long tableSessionId, String deviceToken);

    List<GuestSession> findByTableSessionId(Long tableSessionId);

    List<GuestSession> findByTableSessionIdAndStatus(Long tableSessionId, GuestSessionStatus status);

}