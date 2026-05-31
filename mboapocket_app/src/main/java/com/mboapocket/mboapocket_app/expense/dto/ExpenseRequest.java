package com.mboapocket.mboapocket_app.expense.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {
    private Long categoryId;
    private BigDecimal montant;
    private String description;
    private LocalDate date;
}
