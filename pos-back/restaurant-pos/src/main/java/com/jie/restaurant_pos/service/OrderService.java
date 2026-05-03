package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.entity.RestaurantTable;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import com.jie.restaurant_pos.enums.PaymentStatus;
import com.jie.restaurant_pos.enums.TableStatus;
import com.jie.restaurant_pos.repository.OrderRepository;
import com.jie.restaurant_pos.repository.RestaurantTableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository repository;
    private final RestaurantTableRepository tableRepository;

    public Order getCurrentOrderByTableId(Long tableId) {
        return repository
                .findByTableIdAndOrderStatus(tableId, OrderStatus.SERVING)
                .orElseThrow(() -> new RuntimeException("No current order for this table"));
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

    public Order openTableOrder(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));

        if (table.getTableStatus() == TableStatus.OCCUPIED) {
            return repository.findByTableIdAndOrderStatus(tableId, OrderStatus.SERVING)
                    .orElseThrow(() -> new RuntimeException("No current order for occupied table"));
        }

        if (table.getTableStatus() == TableStatus.AVAILABLE ||
                table.getTableStatus() == TableStatus.RESERVED) {

            Order order = new Order();
            order.setTable(order.getTable());
            order.setOrderStatus(OrderStatus.SERVING);
            order.setPaymentStatus(PaymentStatus.UNPAID);
            order.setOrderType(OrderType.DINING);
            order.setSubtotal(BigDecimal.ZERO);
            order.setTips(BigDecimal.ZERO);
            order.setTax(BigDecimal.ZERO);
            order.setTotal(BigDecimal.ZERO);
            order.setCreatedAt(LocalDateTime.now());
            order.setUpdatedAt(LocalDateTime.now());

            table.setTableStatus(TableStatus.OCCUPIED);
            tableRepository.save(table);

            return repository.save(order);
        }

        throw new RuntimeException("Table cannot be opened");
    }

}
