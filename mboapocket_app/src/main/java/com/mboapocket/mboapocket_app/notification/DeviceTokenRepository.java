package com.mboapocket.mboapocket_app.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, Long> {

    Optional<DeviceToken> findByPushToken(String pushToken);

    List<DeviceToken> findByUserId(Long userId);
}
