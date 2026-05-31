package com.mboapocket.mboapocket_app.stats;

import com.mboapocket.mboapocket_app.budget.Budget;
import com.mboapocket.mboapocket_app.budget.BudgetRepository;
import com.mboapocket.mboapocket_app.category.Category;
import com.mboapocket.mboapocket_app.category.CategoryRepository;
import com.mboapocket.mboapocket_app.expense.ExpenseRepository;
import com.mboapocket.mboapocket_app.stats.dto.CategoryStatItem;
import com.mboapocket.mboapocket_app.stats.dto.MonthlyStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final BudgetRepository budgetRepo;
    private final CategoryRepository categoryRepo;
    private final ExpenseRepository expenseRepo;

    public MonthlyStatsResponse getMonthlyStats(Long userId, int mois, int annee) {
        // Budget du mois
        Optional<Budget> budgetOpt = budgetRepo.findByUserIdAndMoisAndAnnee(userId, mois, annee);
        BigDecimal revenu = budgetOpt.map(Budget::getMontantTotal).orElse(BigDecimal.ZERO);
        BigDecimal objectifEpargne = budgetOpt.map(Budget::getObjectifEpargne).orElse(BigDecimal.ZERO);

        // Dépenses totales du mois
        BigDecimal totalDepense = expenseRepo.sumByUserAndMonth(userId, mois, annee);
        if (totalDepense == null) totalDepense = BigDecimal.ZERO;

        BigDecimal restant = revenu.subtract(totalDepense);
        BigDecimal epargneRealisee = restant.subtract(objectifEpargne);

        double tauxUtil = revenu.compareTo(BigDecimal.ZERO) > 0
                ? totalDepense.divide(revenu, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;

        // Catégories
        List<Category> cats = categoryRepo.findByUserId(userId);
        List<CategoryStatItem> catStats = new ArrayList<>();

        for (Category cat : cats) {
            BigDecimal depCat = expenseRepo.sumByCategoryAndMonth(cat.getId(), mois, annee);
            if (depCat == null) depCat = BigDecimal.ZERO;

            double pctDuTotal = totalDepense.compareTo(BigDecimal.ZERO) > 0
                    ? depCat.divide(totalDepense, 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;

            double pctAlloc = cat.getMontantAlloue().compareTo(BigDecimal.ZERO) > 0
                    ? depCat.divide(cat.getMontantAlloue(), 4, RoundingMode.HALF_UP).doubleValue() * 100 : 0;

            catStats.add(CategoryStatItem.builder()
                    .categoryId(cat.getId())
                    .nom(cat.getNom())
                    .icone(cat.getIcone())
                    .couleur(cat.getCouleur())
                    .montantAlloue(cat.getMontantAlloue())
                    .montantDepense(depCat)
                    .pourcentageBudget(Math.round(pctDuTotal * 10.0) / 10.0)
                    .progressPercent(Math.round(pctAlloc * 10.0) / 10.0)
                    .build());
        }

        // Mois précédent
        int moisPrec = mois == 1 ? 12 : mois - 1;
        int anneePrec = mois == 1 ? annee - 1 : annee;
        BigDecimal depMoisPrec = expenseRepo.sumByUserAndMonth(userId, moisPrec, anneePrec);
        if (depMoisPrec == null) depMoisPrec = BigDecimal.ZERO;

        double evolutionPct = 0;
        if (depMoisPrec.compareTo(BigDecimal.ZERO) > 0) {
            evolutionPct = totalDepense.subtract(depMoisPrec)
                    .divide(depMoisPrec, 4, RoundingMode.HALF_UP).doubleValue() * 100;
            evolutionPct = Math.round(evolutionPct * 10.0) / 10.0;
        }

        // Points forts / faibles
        List<String> forts = new ArrayList<>();
        List<String> faibles = new ArrayList<>();

        if (objectifEpargne.compareTo(BigDecimal.ZERO) > 0 && epargneRealisee.compareTo(BigDecimal.ZERO) >= 0) {
            forts.add("Objectif épargne atteint ✓");
        } else if (objectifEpargne.compareTo(BigDecimal.ZERO) > 0) {
            faibles.add("Objectif épargne non atteint (manque "
                    + epargneRealisee.abs().toPlainString() + " FCFA)");
        }

        for (CategoryStatItem cat : catStats) {
            if (cat.getProgressPercent() <= 80 && cat.getMontantDepense().compareTo(BigDecimal.ZERO) > 0) {
                forts.add(cat.getNom() + " dans les limites ✓");
            } else if (cat.getProgressPercent() > 100) {
                BigDecimal depassement = cat.getMontantDepense().subtract(cat.getMontantAlloue());
                faibles.add(cat.getNom() + " dépassé de " + depassement.toPlainString() + " FCFA");
            }
        }

        if (evolutionPct < 0) {
            forts.add("Moins dépensé qu'en mois précédent (" + Math.abs(evolutionPct) + "%)");
        } else if (evolutionPct > 15) {
            faibles.add("Dépenses en hausse de " + evolutionPct + "% vs mois précédent");
        }

        return MonthlyStatsResponse.builder()
                .mois(mois).annee(annee)
                .revenuMensuel(revenu)
                .totalDepense(totalDepense)
                .montantRestant(restant)
                .objectifEpargne(objectifEpargne)
                .epargnRealisee(epargneRealisee)
                .tauxUtilisation(Math.round(tauxUtil * 10.0) / 10.0)
                .categories(catStats)
                .pointsForts(forts)
                .pointsFaibles(faibles)
                .depenseMoisPrecedent(depMoisPrec)
                .evolutionPct(evolutionPct)
                .build();
    }
}
