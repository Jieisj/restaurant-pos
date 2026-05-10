package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.entity.Customer;
import com.jie.restaurant_pos.enums.OrderType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateOrderRequest {
    private Long tableId;   // optional (for dining)
    private Long userId;    // required

    private OrderType orderType; // DINING / TO_GO / DELIVERY

    Customer customer;

    public CreateOrderRequest(Long tableId, Long userId, OrderType orderType, Customer customer) {
        this.tableId = tableId;
        this.userId = userId;
        this.orderType = orderType;
        this.customer = customer;
    }
}
