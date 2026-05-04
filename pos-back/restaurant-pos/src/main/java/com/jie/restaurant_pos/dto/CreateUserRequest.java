package com.jie.restaurant_pos.dto;

import com.jie.restaurant_pos.enums.Role;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CreateUserRequest {
    private String username;

    private String password;

    private Role role;
}
