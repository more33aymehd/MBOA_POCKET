package com.mboapocket.mboapocket_app.payment;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByDateCreationDesc(Long userId);
    Optional<Payment> findByReference(String reference);
}
