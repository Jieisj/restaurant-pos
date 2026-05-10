package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private Long id;
    private String username;
    private Role role;
    private Long tableId;
    private String tableLabel;
    private Short tableSeat;
    private String token;
}
