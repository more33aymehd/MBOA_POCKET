package com.mboapocket.mboapocket_app.tontine;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TontinePaymentRepository extends JpaRepository<TontinePayment, Long> {

    List<TontinePayment> findByTontineIdOrderByDateDesc(Long tontineId);

    List<TontinePayment> findByTontineIdAndTourNumero(Long tontineId, Integer tourNumero);

    Optional<TontinePayment> findByTontineIdAndPayerIdAndTourNumero(Long tontineId, Long payerId, Integer tourNumero);

    long countByTontineIdAndTourNumeroAndStatut(Long tontineId, Integer tourNumero, String statut);
}
