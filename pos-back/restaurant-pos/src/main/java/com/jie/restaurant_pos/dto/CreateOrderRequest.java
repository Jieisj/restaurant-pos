package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.enums.OrderType;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderRequest {
    private Long tableId;   // optional (for dining)
    private Long userId;    // required

    private OrderType orderType; // DINING / TO_GO / DELIVERY

    // 👇 inline customer info
    private String customerName;
    private String customerAddress;
    private String customerPhone;
}
