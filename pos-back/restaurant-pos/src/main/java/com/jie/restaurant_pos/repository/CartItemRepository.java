package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByOrderId(Long orderId);
    List<CartItem> findByOrderIdAndIsPendingAndIsFinished(
            Long orderId,
            Byte isPending,
            Byte isFinished
    );

    List<CartItem> findByIsPendingAndIsFinished(Byte isPending, Byte isFinished);

    @Query("select item.orderId from CartItem item where item.id = :id")
    Optional<Long> findOrderIdById(@Param("id") Long id);
}
