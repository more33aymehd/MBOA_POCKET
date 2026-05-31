package com.mboapocket.mboapocket_app.expense;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("SELECT COALESCE(SUM(e.montant), 0) FROM Expense e WHERE e.categoryId = :cid AND MONTH(e.date) = :mois AND YEAR(e.date) = :annee")
    BigDecimal sumByCategoryAndMonth(@Param("cid") Long categoryId, @Param("mois") int mois, @Param("annee") int annee);

    @Query("SELECT COALESCE(SUM(e.montant), 0) FROM Expense e WHERE e.userId = :uid AND MONTH(e.date) = :mois AND YEAR(e.date) = :annee")
    BigDecimal sumByUserAndMonth(@Param("uid") Long userId, @Param("mois") int mois, @Param("annee") int annee);

    @Query("SELECT e FROM Expense e WHERE e.categoryId = :cid AND MONTH(e.date) = :mois AND YEAR(e.date) = :annee ORDER BY e.date DESC")
    List<Expense> findByCategoryAndMonth(@Param("cid") Long categoryId, @Param("mois") int mois, @Param("annee") int annee);

    @Query("SELECT e FROM Expense e WHERE e.userId = :uid AND MONTH(e.date) = :mois AND YEAR(e.date) = :annee ORDER BY e.date DESC")
    List<Expense> findByUserAndMonth(@Param("uid") Long userId, @Param("mois") int mois, @Param("annee") int annee);
}
