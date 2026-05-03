package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
}
