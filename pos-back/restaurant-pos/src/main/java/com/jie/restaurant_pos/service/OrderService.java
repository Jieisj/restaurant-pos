package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.Customer;
import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.enums.*;
import com.jie.restaurant_pos.repository.CustomerRepository;
import com.jie.restaurant_pos.repository.OrderRepository;
import com.jie.restaurant_pos.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository repository;
    private final RestaurantTableRepository tableRepository;
    private final CustomerRepository customerRepository;

    public Order getCurrentOrderByTableId(Long tableId) {
        return repository
                .findByTableIdAndOrderStatus(tableId, OrderStatus.SERVING)
                .orElseThrow(() -> new RuntimeException("No current order for this table"));
    }

    public Order getOrderById(Long id){
        return repository.findById(id).orElseThrow(() -> new RuntimeException("Order Not Found"));
    }

    public List<Order> getOrders(LocalDate date, OrderStatus status, OrderType type) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        if (status != null && type != null) {
            return repository.findByOrderTypeAndOrderStatusAndCreatedAtBetween(type, status, start, end);
        }

        if (status != null) {
            return repository.findByOrderStatusAndCreatedAtBetween(status, start, end);
        }

        if (type != null) {
            return repository.findByOrderTypeAndCreatedAtBetween(type, start, end);
        }

        return repository.findByCreatedAtBetween(start, end);
    }

    public Order updateOrder(Long id, Order updatedOrder) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));


        /*
            setting the customer when there is none for the existing order
            json input:
             ----> id (optional, none for creation of new customer)
             ----> name (optional)
             ----> address (optional)
             ----> phoneNumber (optional)
             ----> note (optional)
         */

        if (updatedOrder.getCustomer() != null) {
            Customer customer = order.getCustomer();

            if (customer == null) {
                customer = new Customer();
            }

            customer.setName(updatedOrder.getCustomer().getName());
            customer.setAddress(updatedOrder.getCustomer().getAddress());
            customer.setPhoneNumber(updatedOrder.getCustomer().getPhoneNumber());
            customer.setNote(updatedOrder.getCustomer().getNote());

            Customer savedCustomer = customerRepository.save(customer);
            order.setCustomer(savedCustomer);
        }

        /*
            table logic, switching or no changing
            json input:
             ----> id (required, updated table id for switch table only to available one)
         */

        if (updatedOrder.getTable() != null) {
            Long newTableId = updatedOrder.getTable().getId();

            RestaurantTable newTable = tableRepository.findById(newTableId)
                    .orElseThrow(() -> new RuntimeException("Table not found"));

            if (newTable.getTableStatus() == TableStatus.OCCUPIED) {
                throw new RuntimeException("Cannot move order to an occupied table");
            }

            if (order.getTable() != null) {
                RestaurantTable oldTable = order.getTable();
                oldTable.setTableStatus(TableStatus.AVAILABLE);
                tableRepository.save(oldTable);
            }

            newTable.setTableStatus(TableStatus.OCCUPIED);
            tableRepository.save(newTable);

            order.setTable(newTable);
        }

        /*/ All are optional
            ---> HandlerNameSnapshot
            ---> UsernameSnapshot
            ---> OrderType
            ---> OrderStatus
            ---> PaymentStatus
            ---> TransactionMethod
            ---> HandlerNameSnapshot
            ---> HandlerNameSnapshot
            ---> Subtotal
            ---> Tips
            ---> Tax
            ---> Total
            ---> UpdatedAt
         */

        order.setHandlerNameSnapshot(updatedOrder.getHandlerNameSnapshot());
        order.setUsernameSnapshot(updatedOrder.getUsernameSnapshot());
        order.setOrderType(updatedOrder.getOrderType());
        order.setOrderStatus(updatedOrder.getOrderStatus());
        order.setPaymentStatus(updatedOrder.getPaymentStatus());
        order.setTransactionMethod(updatedOrder.getTransactionMethod());
        order.setCardType(updatedOrder.getCardType());

        order.setSubtotal(updatedOrder.getSubtotal());
        order.setTips(updatedOrder.getTips());
        order.setTax(updatedOrder.getTax());
        order.setTotal(updatedOrder.getTotal());

        order.setUpdatedAt(LocalDateTime.now());

        return repository.save(order);
    }

    public ResponseEntity<Void> deleteOrder(Long id) {
        Order order = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getTable() != null) {
            RestaurantTable table = order.getTable();
            table.setTableStatus(TableStatus.AVAILABLE);
            tableRepository.save(table);
        }

        repository.delete(order);

        return ResponseEntity.noContent().build();
    }
}
