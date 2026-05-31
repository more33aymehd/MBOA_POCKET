package com.mboapocket.mboapocket_app.payment;

import com.mboapocket.mboapocket_app.category.Category;
import com.mboapocket.mboapocket_app.category.CategoryRepository;
import com.mboapocket.mboapocket_app.expense.Expense;
import com.mboapocket.mboapocket_app.expense.ExpenseRepository;
import com.mboapocket.mboapocket_app.payment.dto.PaymentRequest;
import com.mboapocket.mboapocket_app.payment.dto.PaymentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ExpenseRepository expenseRepository;
    private final CategoryRepository categoryRepository;
    private final CamPayService camPayService;

    public PaymentResponse initiate(Long userId, PaymentRequest req)
            throws Exception {

        String externalRef = "MBP-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        CamPayService.CollectResult result = camPayService.collect(
                req.getPhoneFrom() != null ? req.getPhoneFrom() : "237000000000",
                req.getMontant(),
                req.getDescription() != null ? req.getDescription() : "Paiement Mboapocket",
                externalRef
        );

        Payment payment = Payment.builder()
                .userId(userId)
                .categoryId(req.getCategoryId())
                .montant(req.getMontant())
                .methode(req.getMethode())
                .statut(result.status())
                .reference(result.reference())
                .phoneFrom(req.getPhoneFrom())
                .merchantName(req.getMerchantName())
                .description(req.getDescription())
                .build();

        payment = paymentRepository.save(payment);

        // Si succès immédiat (mock) → créer la dépense automatiquement
        if ("SUCCESSFUL".equals(result.status()) && req.getCategoryId() != null) {
            createExpense(userId, req);
        }

        return toResponse(payment);
    }

    public String checkStatus(String reference, Long userId) throws Exception {
        Payment payment = paymentRepository.findByReference(reference)
                .filter(p -> p.getUserId().equals(userId))
                .orElseThrow(() -> new IllegalArgumentException("Paiement introuvable"));

        if ("SUCCESSFUL".equals(payment.getStatut())) {
            return "SUCCESSFUL";
        }

        String newStatus = camPayService.checkStatus(reference);
        payment.setStatut(newStatus);
        paymentRepository.save(payment);

        // Créer la dépense si maintenant successful
        if ("SUCCESSFUL".equals(newStatus) && payment.getCategoryId() != null) {
            PaymentRequest req = new PaymentRequest();
            req.setCategoryId(payment.getCategoryId());
            req.setMontant(payment.getMontant());
            req.setDescription(payment.getDescription());
            createExpense(userId, req);
        }

        return newStatus;
    }

    public List<PaymentResponse> getHistory(Long userId) {
        return paymentRepository.findByUserIdOrderByDateCreationDesc(userId)
                .stream().map(this::toResponse).toList();
    }

    private void createExpense(Long userId, PaymentRequest req) {
        Expense expense = Expense.builder()
                .userId(userId)
                .categoryId(req.getCategoryId())
                .montant(req.getMontant())
                .description(req.getDescription() != null ? req.getDescription() : "Paiement mobile")
                .date(LocalDate.now())
                .build();
        expenseRepository.save(expense);
    }

    private PaymentResponse toResponse(Payment p) {
        Category cat = p.getCategoryId() != null
                ? categoryRepository.findById(p.getCategoryId()).orElse(null)
                : null;
        return PaymentResponse.builder()
                .id(p.getId())
                .montant(p.getMontant())
                .methode(p.getMethode())
                .statut(p.getStatut())
                .reference(p.getReference())
                .merchantName(p.getMerchantName())
                .categoryNom(cat != null ? cat.getNom() : null)
                .categoryIcone(cat != null ? cat.getIcone() : null)
                .dateCreation(p.getDateCreation())
                .build();
    }
}
