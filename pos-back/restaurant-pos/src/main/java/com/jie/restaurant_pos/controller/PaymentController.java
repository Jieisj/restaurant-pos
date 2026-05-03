package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.Payment;
import com.jie.restaurant_pos.service.PaymentService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin
public class PaymentController {
    public PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    public List<Payment> getAllPayment(){
        return service.getAllPayment();
    }
}
