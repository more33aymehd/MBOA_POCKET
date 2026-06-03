package com.mboapocket.mboapocket_app.category;

import com.mboapocket.mboapocket_app.category.dto.CategoryRequest;
import com.mboapocket.mboapocket_app.category.dto.CategoryResponse;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    ResponseEntity<CategoryResponse> create(@AuthenticationPrincipal User user,
                                            @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(categoryService.create(user.getId(), req));
    }

    @GetMapping
    ResponseEntity<List<CategoryResponse>> getAll(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int mois,
            @RequestParam(defaultValue = "0") int annee) {
        int m = mois > 0 ? mois : LocalDate.now().getMonthValue();
        int a = annee > 0 ? annee : LocalDate.now().getYear();
        return ResponseEntity.ok(categoryService.getAll(user.getId(), m, a));
    }

    @PutMapping("/{id}")
    ResponseEntity<CategoryResponse> update(@AuthenticationPrincipal User user,
                                            @PathVariable Long id,
                                            @RequestBody CategoryRequest req) {
        return ResponseEntity.ok(categoryService.update(id, user.getId(), req));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal User user, @PathVariable Long id) {
        categoryService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
