package com.mboapocket.mboapocket_app.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class BudgetProposition {
    private List<CategorySuggestion> categories;
    private String conseil;
}
