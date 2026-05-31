package com.mboapocket.mboapocket_app.expense;

import com.mboapocket.mboapocket_app.expense.dto.ExpenseRequest;
import com.mboapocket.mboapocket_app.expense.dto.ExpenseResponse;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    ResponseEntity<ExpenseResponse> create(@AuthenticationPrincipal User user,
                                           @RequestBody ExpenseRequest req) {
        return ResponseEntity.ok(expenseService.create(user.getId(), req));
    }

    @GetMapping
    ResponseEntity<List<ExpenseResponse>> getByMonth(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int mois,
            @RequestParam(defaultValue = "0") int annee) {
        int m = mois > 0 ? mois : LocalDate.now().getMonthValue();
        int a = annee > 0 ? annee : LocalDate.now().getYear();
        return ResponseEntity.ok(expenseService.getByMonth(user.getId(), m, a));
    }

    @GetMapping("/category/{categoryId}")
    ResponseEntity<List<ExpenseResponse>> getByCategory(
            @AuthenticationPrincipal User user,
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int mois,
            @RequestParam(defaultValue = "0") int annee) {
        int m = mois > 0 ? mois : LocalDate.now().getMonthValue();
        int a = annee > 0 ? annee : LocalDate.now().getYear();
        return ResponseEntity.ok(expenseService.getByCategory(categoryId, user.getId(), m, a));
    }

    @PutMapping("/{id}")
    ResponseEntity<ExpenseResponse> update(@AuthenticationPrincipal User user,
                                           @PathVariable Long id,
                                           @RequestBody ExpenseRequest req) {
        return ResponseEntity.ok(expenseService.update(id, user.getId(), req));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        expenseService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
