package com.mboapocket.mboapocket_app.stats.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data @Builder
public class CategoryStatItem {
    private Long categoryId;
    private String nom;
    private String icone;
    private String couleur;
    private BigDecimal montantAlloue;
    private BigDecimal montantDepense;
    private double pourcentageBudget; // % du total dépensé
    private double progressPercent;   // % de son allocation utilisé
}
