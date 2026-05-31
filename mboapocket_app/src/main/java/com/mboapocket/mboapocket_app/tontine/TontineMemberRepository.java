package com.mboapocket.mboapocket_app.tontine;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TontineMemberRepository extends JpaRepository<TontineMember, Long> {

    List<TontineMember> findByTontineIdOrderByOrdre(Long tontineId);

    Optional<TontineMember> findByTontineIdAndUserEmail(Long tontineId, String email);

    Optional<TontineMember> findByTontineIdAndUserId(Long tontineId, Long userId);

    long countByTontineId(Long tontineId);
}
