package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.dto.LoginRequest;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.service.AuthService;
import com.jie.restaurant_pos.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
public class UserController {
    public UserService service;
    public AuthService authService;

    public List<User> getAllUser(){
        return service.getAllUser();
    }

    @PostMapping("/login")
    public User login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }


    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user){
        return ResponseEntity.ok(service.createUser(user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id){
        service.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser){
        User user = service.updateUser(id, updatedUser);
        return ResponseEntity.ok(user);
    }
}
