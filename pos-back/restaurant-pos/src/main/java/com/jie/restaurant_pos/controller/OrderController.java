package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import com.jie.restaurant_pos.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.aspectj.weaver.ast.Or;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@CrossOrigin
@RequiredArgsConstructor
public class OrderController {
    private final OrderService service;

    @GetMapping
    public List<Order> getOrders(
            @RequestParam LocalDate date,
            @RequestParam(required = false) OrderStatus orderStatus,
            @RequestParam(required = false) OrderType orderType
    ) {
        return service.getOrders(date, orderStatus, orderType);
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id){
        return service.getOrderById(id);
    }

    @GetMapping("/table/{tableId}/current")
    public Order getCurrentOrderByTableId(@PathVariable Long tableId){
        return service.getCurrentOrderByTableId(tableId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrder(
            @PathVariable Long id,
            @RequestBody Order updatedOrder
    ) {
        return ResponseEntity.ok(service.updateOrder(id, updatedOrder));
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        return service.deleteOrder(id);
    }

}
