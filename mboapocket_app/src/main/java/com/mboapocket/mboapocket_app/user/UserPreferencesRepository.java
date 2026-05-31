package com.mboapocket.mboapocket_app.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserPreferencesRepository extends JpaRepository<UserPreferences, Long> {
    Optional<UserPreferences> findByUserId(Long userId);
}
