package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.enums.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateOrderRequest {

    private OrderType orderType;

    private OrderStatus orderStatus;

    private PaymentStatus paymentStatus;

    private TransactionMethod transactionMethod;

    private CardType cardType;

    private BigDecimal subtotal;

    private BigDecimal tips;

    private BigDecimal tax;

    private BigDecimal total;
}