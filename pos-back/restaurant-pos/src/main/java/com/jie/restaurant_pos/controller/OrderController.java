package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.dto.CheckoutRequest;
import com.jie.restaurant_pos.dto.CloseOrderRequest;
import com.jie.restaurant_pos.dto.CreateOrderRequest;
import com.jie.restaurant_pos.dto.UpdateOrderCustomerRequest;
import com.jie.restaurant_pos.dto.UpdateOrderRequest;
import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import com.jie.restaurant_pos.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/order")
@CrossOrigin
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public List<Order> getOrders(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) OrderType type
    ) {
        return orderService.getOrders(date, status, type);
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id) {
        return orderService.getOrderById(id);
    }

    @PostMapping
    public Order createOrder(@RequestBody CreateOrderRequest request) {
        return orderService.createOrder(request);
    }

    @PostMapping("/tables/{tableId}/open")
    public Order openTableOrder(
            @PathVariable Long tableId,
            @RequestParam Long userId
    ) {
        return orderService.openTableOrder(tableId, userId);
    }

    @PostMapping("/tables/{tableId}/close")
    public void closeTableOrder(
            @PathVariable Long tableId,
            @RequestBody CloseOrderRequest request
    ) {
        orderService.closeTableOrder(tableId, request);
    }

    @PutMapping("/{id}")
    public Order updateOrder(
            @PathVariable Long id,
            @RequestBody UpdateOrderRequest request
    ) {
        return orderService.updateOrder(id, request);
    }

    @PutMapping("/{id}/customer")
    public Order updateOrderCustomer(
            @PathVariable Long id,
            @RequestBody UpdateOrderCustomerRequest request
    ) {
        return orderService.updateOrderCustomer(id, request);
    }

    @PutMapping("/{id}/move-table/{newTableId}")
    public Order moveOrderToTable(
            @PathVariable Long id,
            @PathVariable Long newTableId
    ) {
        return orderService.moveOrderToTable(id, newTableId);
    }

    @PutMapping("/{id}/checkout")
    public Order checkoutOrder(
            @PathVariable Long id,
            @RequestBody CheckoutRequest request
    ) {
        return orderService.checkoutOrder(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
    }
}
