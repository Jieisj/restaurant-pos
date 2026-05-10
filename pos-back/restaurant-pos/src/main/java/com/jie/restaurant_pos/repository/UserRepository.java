package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.User;
import com.jie.restaurant_pos.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByIdAndRole(Long id, Role role);
    List<User> findByRoleOrderByUsernameAsc(Role role);
    List<User> findByRoleAndTableId(Role role, Long tableId);
}
