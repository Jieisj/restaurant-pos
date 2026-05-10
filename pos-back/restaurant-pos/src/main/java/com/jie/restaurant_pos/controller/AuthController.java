package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.dto.LoginRequest;
import com.jie.restaurant_pos.dto.LoginResponse;
import com.jie.restaurant_pos.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}