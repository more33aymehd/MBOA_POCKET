package com.mboapocket.mboapocket_app.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class SaveAllocationRequest {
    private List<CategorySuggestion> categories;
}
