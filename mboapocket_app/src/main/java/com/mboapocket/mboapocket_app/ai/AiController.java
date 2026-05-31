package com.mboapocket.mboapocket_app.ai;

import com.mboapocket.mboapocket_app.ai.dto.BudgetProposition;
import com.mboapocket.mboapocket_app.ai.dto.ChatRequest;
import com.mboapocket.mboapocket_app.ai.dto.SaveAllocationRequest;
import com.mboapocket.mboapocket_app.ai.dto.UserProfileRequest;
import com.mboapocket.mboapocket_app.category.CategoryService;
import com.mboapocket.mboapocket_app.category.dto.CategoryRequest;
import com.mboapocket.mboapocket_app.category.dto.CategoryResponse;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;
    private final CategoryService categoryService;

    @PostMapping("/chat")
    ResponseEntity<Map<String, String>> chat(@AuthenticationPrincipal User user,
                                             @RequestBody ChatRequest request) {
        try {
            String response = aiService.chat(user.getId(), request.getMessage());
            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @PostMapping("/propose-budget")
    ResponseEntity<BudgetProposition> propose(@AuthenticationPrincipal User user,
                                              @RequestBody UserProfileRequest request) {
        try {
            return ResponseEntity.ok(aiService.proposeBudget(request));
        } catch (Exception e) {
            throw new RuntimeException(e.getMessage());
        }
    }

    @PostMapping("/save-allocation")
    ResponseEntity<List<CategoryResponse>> save(@AuthenticationPrincipal User user,
                                                @RequestBody SaveAllocationRequest request) {
        List<CategoryResponse> created = request.getCategories().stream()
                .map(s -> {
                    CategoryRequest req = new CategoryRequest();
                    req.setNom(s.getNom());
                    req.setIcone(s.getIcone());
                    req.setCouleur(s.getCouleur());
                    req.setMontantAlloue(s.getMontantAlloue());
                    return categoryService.create(user.getId(), req);
                })
                .toList();
        return ResponseEntity.ok(created);
    }

    @ExceptionHandler(RuntimeException.class)
    ResponseEntity<Map<String, String>> handleError(RuntimeException e) {
        String msg = e.getMessage() != null ? e.getMessage() : "Erreur IA interne";
        return ResponseEntity.internalServerError().body(Map.of("error", msg));
    }
}
