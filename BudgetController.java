package com.mboapocket.mboapocket_app.budget;

import com.mboapocket.mboapocket_app.budget.dto.BudgetRequest;
import com.mboapocket.mboapocket_app.budget.dto.BudgetResponse;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    ResponseEntity<BudgetResponse> create(@AuthenticationPrincipal User user,
                                          @RequestBody BudgetRequest req) {
        return ResponseEntity.ok(budgetService.create(user.getId(), req));
    }

    @GetMapping("/current")
    ResponseEntity<?> getCurrent(@AuthenticationPrincipal User user) {
        return budgetService.getCurrent(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}")
    ResponseEntity<BudgetResponse> update(@AuthenticationPrincipal User user,
                                          @PathVariable Long id,
                                          @RequestBody BudgetRequest req) {
        return ResponseEntity.ok(budgetService.update(id, user.getId(), req));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
