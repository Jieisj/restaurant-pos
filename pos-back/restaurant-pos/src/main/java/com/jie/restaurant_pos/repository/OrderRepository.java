package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.Order;
import com.jie.restaurant_pos.enums.OrderStatus;
import com.jie.restaurant_pos.enums.OrderType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByTableIdAndOrderStatus(
            Long tableId,
            OrderStatus orderStatus
    );

    List<Order> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    List<Order> findByOrderStatusAndCreatedAtBetween(
            OrderStatus orderStatus,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Order> findByOrderTypeAndCreatedAtBetween(
            OrderType orderType,
            LocalDateTime start,
            LocalDateTime end
    );

    List<Order> findByOrderTypeAndOrderStatusAndCreatedAtBetween(
            OrderType orderType,
            OrderStatus orderStatus,
            LocalDateTime start,
            LocalDateTime end
    );
}
