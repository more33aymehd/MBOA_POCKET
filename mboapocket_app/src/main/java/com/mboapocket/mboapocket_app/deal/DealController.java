package com.mboapocket.mboapocket_app.deal;

import com.mboapocket.mboapocket_app.deal.dto.DealRequest;
import com.mboapocket.mboapocket_app.deal.dto.DealResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deals")
@RequiredArgsConstructor
public class DealController {

    private final DealService dealService;

    @GetMapping("/nearby")
    ResponseEntity<List<DealResponse>> nearby(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double rayon,
            @RequestParam(required = false) String categorie) {

        List<DealResponse> deals = (categorie != null && !categorie.isBlank() && !"TOUS".equalsIgnoreCase(categorie))
                ? dealService.getNearbyByCategorie(lat, lng, rayon, categorie)
                : dealService.getNearby(lat, lng, rayon);

        return ResponseEntity.ok(deals);
    }

    @GetMapping("/{id}")
    ResponseEntity<DealResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dealService.getById(id));
    }

    @PostMapping
    ResponseEntity<DealResponse> create(@RequestBody DealRequest request) {
        return ResponseEntity.ok(dealService.create(request));
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Map<String, String>> handleError(Exception e) {
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    }
}
