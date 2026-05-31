package com.mboapocket.mboapocket_app.stats;

import com.mboapocket.mboapocket_app.stats.dto.MonthlyStatsResponse;
import com.mboapocket.mboapocket_app.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/monthly")
    ResponseEntity<MonthlyStatsResponse> monthly(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) Integer mois,
            @RequestParam(required = false) Integer annee) {

        LocalDate now = LocalDate.now();
        int m = mois != null ? mois : now.getMonthValue();
        int a = annee != null ? annee : now.getYear();

        return ResponseEntity.ok(statsService.getMonthlyStats(user.getId(), m, a));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> handleError(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
