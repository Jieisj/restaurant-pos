package com.jie.restaurant_pos.entity;

import com.jie.restaurant_pos.enums.CardType;
import com.jie.restaurant_pos.enums.TransactionMethod;
import com.jie.restaurant_pos.enums.TransactionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trans_payments")
@Getter
@Setter
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    @Enumerated(EnumType.STRING)
    private TransactionMethod transactionMethod;

    @Enumerated(EnumType.STRING)
    private TransactionStatus transactionStatus;

    @Enumerated(EnumType.STRING)
    private CardType cardType;

    private BigDecimal amountPaid;

    private BigDecimal changeAmount;

    private BigDecimal tips;

    private LocalDateTime paidAt;
}
