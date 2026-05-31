package com.mboapocket.mboapocket_app.expense;

import com.mboapocket.mboapocket_app.category.Category;
import com.mboapocket.mboapocket_app.category.CategoryRepository;
import com.mboapocket.mboapocket_app.expense.dto.ExpenseRequest;
import com.mboapocket.mboapocket_app.expense.dto.ExpenseResponse;
import com.mboapocket.mboapocket_app.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final NotificationService notificationService;

    public ExpenseResponse create(Long userId, ExpenseRequest req) {
        Category cat = categoryRepository.findById(req.getCategoryId())
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable"));

        Expense expense = Expense.builder()
                .userId(userId)
                .categoryId(req.getCategoryId())
                .montant(req.getMontant())
                .description(req.getDescription())
                .date(req.getDate() != null ? req.getDate() : LocalDate.now())
                .build();

        ExpenseResponse response = toResponse(expenseRepository.save(expense), cat);

        String montantStr = NumberFormat.getNumberInstance(Locale.FRANCE).format(req.getMontant().longValue()) + " FCFA";
        String desc = req.getDescription() != null && !req.getDescription().isBlank()
                ? req.getDescription() : cat.getNom();
        notificationService.createAndPush(
                userId,
                "PAIEMENT",
                cat.getIcone() + " Dépense enregistrée",
                montantStr + " débités — " + desc,
                String.valueOf(expense.getId())
        );

        return response;
    }

    public List<ExpenseResponse> getByMonth(Long userId, int mois, int annee) {
        return expenseRepository.findByUserAndMonth(userId, mois, annee).stream()
                .map(e -> toResponse(e, null)).toList();
    }

    public List<ExpenseResponse> getByCategory(Long categoryId, Long userId, int mois, int annee) {
        categoryRepository.findById(categoryId)
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Catégorie introuvable"));
        return expenseRepository.findByCategoryAndMonth(categoryId, mois, annee).stream()
                .map(e -> toResponse(e, null)).toList();
    }

    public ExpenseResponse update(Long id, Long userId, ExpenseRequest req) {
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Dépense introuvable"));
        if (req.getMontant() != null) expense.setMontant(req.getMontant());
        if (req.getDescription() != null) expense.setDescription(req.getDescription());
        if (req.getDate() != null) expense.setDate(req.getDate());
        if (req.getCategoryId() != null) expense.setCategoryId(req.getCategoryId());
        return toResponse(expenseRepository.save(expense), null);
    }

    public void delete(Long id, Long userId) {
        Expense expense = expenseRepository.findById(id)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Dépense introuvable"));
        expenseRepository.delete(expense);
    }

    private ExpenseResponse toResponse(Expense e, Category providedCat) {
        Category cat = providedCat != null
                ? providedCat
                : categoryRepository.findById(e.getCategoryId()).orElse(null);
        return ExpenseResponse.builder()
                .id(e.getId()).userId(e.getUserId()).categoryId(e.getCategoryId())
                .categoryNom(cat != null ? cat.getNom() : "")
                .categoryIcone(cat != null ? cat.getIcone() : "💰")
                .categoryCouleur(cat != null ? cat.getCouleur() : "#6B7280")
                .montant(e.getMontant()).description(e.getDescription()).date(e.getDate())
                .build();
    }
}
