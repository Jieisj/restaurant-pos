package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.dto.AssignTableCustomerRequest;
import com.jie.restaurant_pos.dto.CreateUserRequest;
import com.jie.restaurant_pos.dto.UserSummaryResponse;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin
@RequiredArgsConstructor
public class UserController {
    private final UserService service;

    @GetMapping
    public List<User> getAllUsers() {
        return service.getAllUser();
    }

    @GetMapping("/customers")
    public List<UserSummaryResponse> getCustomerUsers() {
        return service.getCustomerUsers();
    }

    @PutMapping("/table-assignments/{tableId}")
    public List<UserSummaryResponse> assignCustomerToTable(
            @PathVariable Long tableId,
            @RequestBody AssignTableCustomerRequest request
    ) {
        return service.assignCustomerToTable(tableId, request.getCustomerId());
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
