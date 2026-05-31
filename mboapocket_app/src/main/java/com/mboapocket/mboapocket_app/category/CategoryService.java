package com.mboapocket.mboapocket_app.category;

import com.mboapocket.mboapocket_app.category.dto.CategoryRequest;
import com.mboapocket.mboapocket_app.category.dto.CategoryResponse;
import com.mboapocket.mboapocket_app.expense.ExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;

    public CategoryResponse create(Long userId, CategoryRequest req) {
        Category cat = Category.builder()
                .userId(userId)
                .nom(req.getNom())
                .icone(req.getIcone() != null ? req.getIcone() : "💰")
                .couleur(req.getCouleur() != null ? req.getCouleur() : "#1B8A5A")
                .montantAlloue(req.getMontantAlloue())
                .build();
        return toResponse(categoryRepository.save(cat), LocalDate.now().getMonthValue(), LocalDate.now().getYear());
    }

    public List<CategoryResponse> getAll(Long userId, int mois, int annee) {
        return categoryRepository.findByUserId(userId).stream()
                .map(c -> toResponse(c, mois, annee))
                .toList();
    }

    public CategoryResponse update(Long id, Long userId, CategoryRequest req) {
        Category cat = categoryRepository.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable"));
        if (req.getNom() != null) cat.setNom(req.getNom());
        if (req.getIcone() != null) cat.setIcone(req.getIcone());
        if (req.getCouleur() != null) cat.setCouleur(req.getCouleur());
        if (req.getMontantAlloue() != null) cat.setMontantAlloue(req.getMontantAlloue());
        return toResponse(categoryRepository.save(cat), LocalDate.now().getMonthValue(), LocalDate.now().getYear());
    }

    public void delete(Long id, Long userId) {
        Category cat = categoryRepository.findById(id)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable"));
        categoryRepository.delete(cat);
    }

    public CategoryResponse toResponse(Category c, int mois, int annee) {
        BigDecimal depense = expenseRepository.sumByCategoryAndMonth(c.getId(), mois, annee);
        if (depense == null) depense = BigDecimal.ZERO;
        BigDecimal restant = c.getMontantAlloue().subtract(depense);
        double pct = c.getMontantAlloue().compareTo(BigDecimal.ZERO) > 0
                ? depense.divide(c.getMontantAlloue(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                : 0;
        return CategoryResponse.builder()
                .id(c.getId()).userId(c.getUserId())
                .nom(c.getNom()).icone(c.getIcone()).couleur(c.getCouleur())
                .montantAlloue(c.getMontantAlloue())
                .montantDepense(depense).montantRestant(restant)
                .progressPercent(pct)
                .build();
    }
}
