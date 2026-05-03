package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import com.jie.restaurant_pos.service.OrderService;
import org.aspectj.weaver.ast.Or;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@CrossOrigin
public class OrderController {
    public OrderService service;

    @GetMapping
    public List<Order> getOrders(
            @RequestParam LocalDate date,
            @RequestParam(required = false) OrderStatus orderStatus,
            @RequestParam(required = false) OrderType orderType
    ) {
        return service.getOrders(date, orderStatus, orderType);
    }

    @GetMapping("/table/{tableId}/current")
    public Order getCurrentOrderByTableId(@PathVariable Long id){
        return service.getCurrentOrderByTableId(id);
    }

    @PostMapping("/table/{tableId}/open")
    public Order openTableOrder(@PathVariable Long tableId) {
        return service.openTableOrder(tableId);
    }
}
