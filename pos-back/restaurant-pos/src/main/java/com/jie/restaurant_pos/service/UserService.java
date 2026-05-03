package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.LoginRequest;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private BCryptPasswordEncoder passwordEncoder;
    private AuthService authService;

    public User createUser(User user) {
        String hashedPassword = passwordEncoder.encode(user.getPasswordHash());
        user.setPasswordHash(hashedPassword);
        return repository.save(user);
    }

    public List<User> getAllUser(){
        return  repository.findAll();
    }

    public void deleteUserById(Long id) {
        repository.deleteById(id);
    }

    public User updateUser(Long id, User updatedUser) {
        User user = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRole(updatedUser.getRole());
        user.setUsername(updatedUser.getUsername());

        if (updatedUser.getPasswordHash() != null) {
            String hashed = passwordEncoder.encode(updatedUser.getPasswordHash());
            user.setPasswordHash(hashed);
        }

        return repository.save(user);
    }


}
