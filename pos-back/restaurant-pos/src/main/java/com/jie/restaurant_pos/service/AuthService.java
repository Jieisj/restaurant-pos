package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.LoginRequest;
import com.jie.restaurant_pos.dto.LoginResponse;
import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.repository.UserRepository;
import com.jie.restaurant_pos.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid username or password");
        }

        String token = jwtUtil.generateToken(user.getUsername());
        RestaurantTable table = user.getTable();

        return new LoginResponse(
                user.getId(),
                user.getUsername(),
                user.getRole(),
                table == null ? null : table.getId(),
                table == null ? null : table.getLabel(),
                table == null ? null : table.getSeat(),
                token
        );
    }
}
