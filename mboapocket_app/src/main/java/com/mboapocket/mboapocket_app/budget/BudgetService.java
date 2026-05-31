package com.mboapocket.mboapocket_app.budget;

import com.mboapocket.mboapocket_app.budget.dto.BudgetRequest;
import com.mboapocket.mboapocket_app.budget.dto.BudgetResponse;
import com.mboapocket.mboapocket_app.expense.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetResponse create(Long userId, BudgetRequest req) {
        int mois = req.getMois() != null ? req.getMois() : LocalDate.now().getMonthValue();
        int annee = req.getAnnee() != null ? req.getAnnee() : LocalDate.now().getYear();

        if (budgetRepository.findByUserIdAndMoisAndAnnee(userId, mois, annee).isPresent()) {
            throw new IllegalArgumentException("Un budget existe déjà pour ce mois");
        }

        Budget budget = Budget.builder()
                .userId(userId)
                .montantTotal(req.getMontantTotal())
                .objectifEpargne(req.getObjectifEpargne() != null ? req.getObjectifEpargne() : BigDecimal.ZERO)
                .mois(mois).annee(annee)
                .build();

        return toResponse(budgetRepository.save(budget));
    }

    public Optional<BudgetResponse> getCurrent(Long userId) {
        LocalDate now = LocalDate.now();
        return budgetRepository
                .findByUserIdAndMoisAndAnnee(userId, now.getMonthValue(), now.getYear())
                .map(this::toResponse);
    }

    public BudgetResponse update(Long id, Long userId, BudgetRequest req) {
        Budget budget = budgetRepository.findById(id)
                .filter(b -> b.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Budget introuvable"));
        if (req.getMontantTotal() != null) budget.setMontantTotal(req.getMontantTotal());
        if (req.getObjectifEpargne() != null) budget.setObjectifEpargne(req.getObjectifEpargne());
        return toResponse(budgetRepository.save(budget));
    }

    private BudgetResponse toResponse(Budget b) {
        BigDecimal depense = expenseRepository.sumByUserAndMonth(b.getUserId(), b.getMois(), b.getAnnee());
        if (depense == null) depense = BigDecimal.ZERO;
        BigDecimal restant = b.getMontantTotal().subtract(depense);

        return BudgetResponse.builder()
                .id(b.getId()).userId(b.getUserId())
                .montantTotal(b.getMontantTotal())
                .montantDepense(depense)
                .montantRestant(restant)
                .objectifEpargne(b.getObjectifEpargne())
                .mois(b.getMois()).annee(b.getAnnee())
                .build();
    }
}
