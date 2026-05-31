package com.mboapocket.mboapocket_app.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mboapocket.mboapocket_app.ai.dto.BudgetProposition;
import com.mboapocket.mboapocket_app.ai.dto.CategorySuggestion;
import com.mboapocket.mboapocket_app.ai.dto.UserProfileRequest;
import com.mboapocket.mboapocket_app.budget.BudgetService;
import com.mboapocket.mboapocket_app.budget.dto.BudgetResponse;
import com.mboapocket.mboapocket_app.category.CategoryService;
import com.mboapocket.mboapocket_app.category.dto.CategoryResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AiService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.model}")
    private String model;

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private CategoryService categoryService;

    private final ObjectMapper mapper = new ObjectMapper();

    public String chat(Long userId, String message) throws IOException, InterruptedException {
        LocalDate now = LocalDate.now();
        int mois = now.getMonthValue();
        int annee = now.getYear();

        // Charger le contexte financier de l'utilisateur
        Optional<BudgetResponse> budgetOpt = budgetService.getCurrent(userId);
        List<CategoryResponse> categories = categoryService.getAll(userId, mois, annee);

        StringBuilder context = new StringBuilder();
        context.append("=== CONTEXTE FINANCIER DE L'UTILISATEUR (").append(mois).append("/").append(annee).append(") ===\n\n");

        if (budgetOpt.isPresent()) {
            BudgetResponse b = budgetOpt.get();
            context.append("Budget mensuel total : ").append(b.getMontantTotal()).append(" FCFA\n");
            context.append("Montant dépensé : ").append(b.getMontantDepense() != null ? b.getMontantDepense() : 0).append(" FCFA\n");
            context.append("Montant restant : ").append(b.getMontantRestant() != null ? b.getMontantRestant() : b.getMontantTotal()).append(" FCFA\n");
            context.append("Objectif épargne : ").append(b.getObjectifEpargne() != null ? b.getObjectifEpargne() : 0).append(" FCFA\n\n");
        } else {
            context.append("Aucun budget configuré pour ce mois.\n\n");
        }

        if (!categories.isEmpty()) {
            context.append("Zones de dépenses :\n");
            for (CategoryResponse cat : categories) {
                context.append("- ").append(cat.getIcone()).append(" ").append(cat.getNom())
                        .append(" : ").append(cat.getMontantAlloue()).append(" FCFA alloué, ")
                        .append(cat.getMontantDepense()).append(" FCFA dépensé ")
                        .append("(").append(String.format("%.0f", cat.getProgressPercent())).append("%)\n");
            }
        } else {
            context.append("Aucune zone de dépenses configurée.\n");
        }

        String systemPrompt = "Tu es un assistant financier personnel expert pour Mboapocket, une app de gestion budgétaire pour le marché camerounais.\n\n"
                + context
                + "\n=== INSTRUCTIONS ===\n"
                + "- Réponds en français, de manière concise, chaleureuse et personnalisée\n"
                + "- Utilise les données financières réelles ci-dessus pour personnaliser tes réponses\n"
                + "- Donne des conseils pratiques adaptés au contexte et au coût de vie camerounais\n"
                + "- Utilise des emojis pertinents pour rendre la réponse agréable\n"
                + "- Sois direct et utile — maximum 150 mots par réponse\n"
                + "- Si l'utilisateur demande quelque chose hors de ta portée financière, recentre poliment";

        // Appel Groq en mode texte libre (pas JSON)
        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);

        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", message);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(systemMsg, userMsg));
        requestBody.put("temperature", 0.7);
        requestBody.put("max_tokens", 300);

        String bodyJson = mapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Groq API erreur " + response.statusCode());
        }

        return mapper.readTree(response.body())
                .path("choices").get(0)
                .path("message")
                .path("content")
                .asText();
    }

    public BudgetProposition proposeBudget(UserProfileRequest profile) throws IOException, InterruptedException {
        String prompt = buildPrompt(profile);
        String content = callGroq(prompt);
        return parseProposition(content, profile.getRevenuMensuel());
    }

    private String buildPrompt(UserProfileRequest p) {
        String priorites = (p.getPriorites() != null && !p.getPriorites().isEmpty())
                ? String.join(", ", p.getPriorites())
                : "équilibre général";

        return "Tu es un conseiller financier expert pour les ménages camerounais.\n\n"
                + "Profil utilisateur :\n"
                + "- Revenu mensuel : " + p.getRevenuMensuel() + " FCFA\n"
                + "- Situation professionnelle : " + p.getSituation() + "\n"
                + "- Foyer : " + p.getFoyer() + "\n"
                + "- Priorités : " + priorites + "\n"
                + "- Loyer/crédit fixe : " + p.getLoyer() + " FCFA\n"
                + "- Objectif : " + p.getObjectif() + "\n\n"
                + "Génère une allocation budgétaire réaliste adaptée au Cameroun.\n"
                + "Règles STRICTES :\n"
                + "1. La somme exacte des montantAlloue DOIT être " + p.getRevenuMensuel() + " FCFA\n"
                + "2. Maximum 7 catégories\n"
                + "3. Utilise des emojis expressifs pour icone\n"
                + "4. Couleurs hex variées et harmonieuses\n"
                + "5. Adapte les montants au coût de vie camerounais\n\n"
                + "Retourne UNIQUEMENT ce JSON valide :\n"
                + "{\n"
                + "  \"categories\": [\n"
                + "    {\"nom\":\"Alimentation\",\"icone\":\"food\",\"couleur\":\"#1B8A5A\",\"montantAlloue\":45000,\"pourcentage\":30}\n"
                + "  ],\n"
                + "  \"conseil\": \"Deux phrases de conseil personnalise.\"\n"
                + "}";
    }

    private String callGroq(String userPrompt) throws IOException, InterruptedException {
        // System message
        Map<String, String> systemMsg = new HashMap<>();
        systemMsg.put("role", "system");
        systemMsg.put("content", "Tu es un assistant financier camerounais. Reponds UNIQUEMENT en JSON valide, sans texte autour.");

        // User message
        Map<String, String> userMsg = new HashMap<>();
        userMsg.put("role", "user");
        userMsg.put("content", userPrompt);

        // Response format
        Map<String, String> responseFormat = new HashMap<>();
        responseFormat.put("type", "json_object");

        // Full request body
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", model);
        requestBody.put("messages", List.of(systemMsg, userMsg));
        requestBody.put("temperature", 0.3);
        requestBody.put("response_format", responseFormat);

        String bodyJson = mapper.writeValueAsString(requestBody);

        HttpClient client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(bodyJson))
                .timeout(Duration.ofSeconds(30))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Groq API erreur " + response.statusCode() + " : " + response.body());
        }

        return mapper.readTree(response.body())
                .path("choices").get(0)
                .path("message")
                .path("content")
                .asText();
    }

    private BudgetProposition parseProposition(String json, BigDecimal revenu) throws IOException {
        BudgetProposition proposition = mapper.readValue(json, BudgetProposition.class);

        List<CategorySuggestion> cats = proposition.getCategories();
        if (cats == null || cats.isEmpty()) {
            throw new RuntimeException("L'IA n'a retourné aucune catégorie");
        }

        // Ajustement si la somme ne correspond pas exactement au revenu
        BigDecimal sum = cats.stream()
                .map(CategorySuggestion::getMontantAlloue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diff = revenu.subtract(sum);
        if (diff.compareTo(BigDecimal.ZERO) != 0) {
            CategorySuggestion last = cats.get(cats.size() - 1);
            last.setMontantAlloue(last.getMontantAlloue().add(diff));
        }

        return proposition;
    }
}
