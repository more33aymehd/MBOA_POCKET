package com.mboapocket.mboapocket_app.category.dto;

import lombok.*;
import java.math.BigDecimal;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private Long userId;
    private String nom;
    private String icone;
    private String couleur;
    private BigDecimal montantAlloue;
    private BigDecimal montantDepense;
    private BigDecimal montantRestant;
    private double progressPercent;
}
