package com.mboapocket.mboapocket_app.budget.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BudgetResponse {
    private Long id;
    private Long userId;
    private BigDecimal montantTotal;
    private BigDecimal montantDepense;
    private BigDecimal montantRestant;
    private BigDecimal objectifEpargne;
    private Integer mois;
    private Integer annee;
}
