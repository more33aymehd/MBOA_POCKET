package com.mboapocket.mboapocket_app.budget.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BudgetRequest {
    private BigDecimal montantTotal;
    private BigDecimal objectifEpargne;
    private Integer mois;
    private Integer annee;
}
