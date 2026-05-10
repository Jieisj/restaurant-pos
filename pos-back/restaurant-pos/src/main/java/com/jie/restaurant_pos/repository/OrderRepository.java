package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndOrderStatusAndOrderType(LocalDateTime start, LocalDateTime end, OrderStatus status, OrderType type);

    List<Order> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndOrderStatus(LocalDateTime start, LocalDateTime end, OrderStatus status);

    List<Order> findByCreatedAtGreaterThanEqualAndCreatedAtLessThanAndOrderType(LocalDateTime start, LocalDateTime end, OrderType type);

    List<Order> findByCreatedAtGreaterThanEqualAndCreatedAtLessThan(LocalDateTime start, LocalDateTime end);

    List<Order> findByOrderStatusAndOrderType(OrderStatus status, OrderType type);

    List<Order> findByOrderStatus(OrderStatus status);

    List<Order> findByOrderType(OrderType type);

    List<Order> findByTableIdAndOrderStatusOrderByIdDesc(Long tableId, OrderStatus orderStatus);
}
