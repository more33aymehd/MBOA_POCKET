package com.mboapocket.mboapocket_app.budget;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUserIdAndMoisAndAnnee(Long userId, Integer mois, Integer annee);
}
