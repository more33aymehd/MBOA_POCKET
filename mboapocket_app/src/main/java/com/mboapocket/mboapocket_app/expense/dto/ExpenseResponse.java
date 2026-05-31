package com.mboapocket.mboapocket_app.expense.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class ExpenseResponse {
    private Long id;
    private Long userId;
    private Long categoryId;
    private String categoryNom;
    private String categoryIcone;
    private String categoryCouleur;
    private BigDecimal montant;
    private String description;
    private LocalDate date;
}
