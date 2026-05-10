package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.enums.CardType;
import com.jie.restaurant_pos.enums.TransactionMethod;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CheckoutRequest {

    private TransactionMethod transactionMethod;

    private CardType cardType;

    private BigDecimal subtotal;

    private BigDecimal tips;

    private BigDecimal tax;

    private BigDecimal total;
}