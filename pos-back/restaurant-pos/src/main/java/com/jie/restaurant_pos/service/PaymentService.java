package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.Payment;
import com.jie.restaurant_pos.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository repository;

    public List<Payment> getAllPayment(){
        return repository.findAll();
    }
}
