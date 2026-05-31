package com.mboapocket.mboapocket_app.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserIdOrderByDateDesc(Long userId);

    List<Notification> findByUserIdAndTypeOrderByDateDesc(Long userId, String type);

    long countByUserIdAndLueFalse(Long userId);

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.lue = true WHERE n.userId = :userId")
    void markAllReadByUserId(Long userId);
}
