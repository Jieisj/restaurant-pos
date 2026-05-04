package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.dto.CreateUserRequest;
import com.jie.restaurant_pos.dto.LoginRequest;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.service.AuthService;
import com.jie.restaurant_pos.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
@RequiredArgsConstructor
public class UserController {
    private final UserService service;
    private final AuthService authService;

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest createUserRequest){
        return ResponseEntity.ok(service.createUser(createUserRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        service.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser){
        User user = service.updateUser(id, updatedUser);
        return ResponseEntity.ok(user);
    }
}
