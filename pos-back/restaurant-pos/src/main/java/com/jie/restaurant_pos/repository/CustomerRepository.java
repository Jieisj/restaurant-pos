package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByPhoneNumber(String phoneNumber);

    Optional<Customer> findByName(String name);

    Optional<Customer> findByAddress(String address);
}
