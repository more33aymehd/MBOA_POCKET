package com.mboapocket.mboapocket_app.stats.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data @Builder
public class MonthlyStatsResponse {
    private int mois;
    private int annee;

    // Budget
    private BigDecimal revenuMensuel;
    private BigDecimal totalDepense;
    private BigDecimal montantRestant;
    private BigDecimal objectifEpargne;
    private BigDecimal epargnRealisee;   // restant - objectifEpargne (si positif)
    private double tauxUtilisation;      // % du budget consommé

    // Par catégorie
    private List<CategoryStatItem> categories;

    // Points forts / faibles
    private List<String> pointsForts;
    private List<String> pointsFaibles;

    // Comparaison mois précédent
    private BigDecimal depenseMoisPrecedent;
    private double evolutionPct; // % d'évolution vs mois précédent
}
