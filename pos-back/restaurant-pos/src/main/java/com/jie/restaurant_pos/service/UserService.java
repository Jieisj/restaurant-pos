package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.dto.CreateUserRequest;
import com.jie.restaurant_pos.dto.UserSummaryResponse;
import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.enums.Role;
import com.jie.restaurant_pos.repository.RestaurantTableRepository;
import com.jie.restaurant_pos.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final RestaurantTableRepository tableRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public User createUser(CreateUserRequest createUserRequest) {
        String hashedPassword = passwordEncoder.encode(createUserRequest.getPassword());
        User user = new User();
        user.setUsername(createUserRequest.getUsername());
        user.setPasswordHash(hashedPassword);
        user.setRole(createUserRequest.getRole());
        user.setTable(resolveTable(createUserRequest.getTableId()));
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
        user.setTable(updatedUser.getTable());

        if (updatedUser.getPasswordHash() != null) {
            String hashed = passwordEncoder.encode(updatedUser.getPasswordHash());
            user.setPasswordHash(hashed);
        }

        return repository.save(user);
    }

    public List<UserSummaryResponse> getCustomerUsers() {
        return repository.findByRoleOrderByUsernameAsc(Role.CUSTOMER)
                .stream()
                .map(UserSummaryResponse::new)
                .toList();
    }

    @Transactional
    public List<UserSummaryResponse> assignCustomerToTable(Long tableId, Long customerId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        List<User> assignedCustomers = repository.findByRoleAndTableId(Role.CUSTOMER, tableId);

        assignedCustomers.stream()
                .filter(user -> customerId == null || !customerId.equals(user.getId()))
                .forEach(user -> user.setTable(null));

        if (!assignedCustomers.isEmpty()) {
            repository.saveAll(assignedCustomers);
        }

        if (customerId != null) {
            User customer = repository.findByIdAndRole(customerId, Role.CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("Customer account not found"));

            customer.setTable(table);
            repository.save(customer);
        }

        return getCustomerUsers();
    }

    private RestaurantTable resolveTable(Long tableId) {
        if (tableId == null) return null;

        return tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
    }


    public List<User> getAllUser() {
        return repository.findAll();
    }
}
