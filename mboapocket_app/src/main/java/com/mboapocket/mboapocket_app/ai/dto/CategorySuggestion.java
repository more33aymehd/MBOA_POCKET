package com.mboapocket.mboapocket_app.ai.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CategorySuggestion {
    private String nom;
    private String icone;
    private String couleur;
    private BigDecimal montantAlloue;
    private double pourcentage;
}
