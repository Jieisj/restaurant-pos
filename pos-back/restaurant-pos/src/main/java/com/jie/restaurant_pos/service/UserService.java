package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.CreateUserRequest;
import com.jie.restaurant_pos.dto.LoginRequest;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;

    public User createUser(CreateUserRequest createUserRequest) {
        String hashedPassword = passwordEncoder.encode(createUserRequest.getPassword());
        User user = new User();
        user.setUsername(createUserRequest.getUsername());
        user.setPasswordHash(hashedPassword);
        user.setRole(createUserRequest.getRole());
        return repository.save(user);
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
