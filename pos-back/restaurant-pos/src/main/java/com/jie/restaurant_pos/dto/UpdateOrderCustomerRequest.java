package com.jie.restaurant_pos.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderCustomerRequest {

    private String name;

    private String address;

    private String phoneNumber;

    private String note;
}