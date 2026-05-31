package com.mboapocket.mboapocket_app.expense;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "expenses")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Expense {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal montant;

    private String description;

    @Column(nullable = false)
    private LocalDate date;
}
