package com.mboapocket.mboapocket_app.category.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CategoryRequest {
    private String nom;
    private String icone;
    private String couleur;
    private BigDecimal montantAlloue;
}
