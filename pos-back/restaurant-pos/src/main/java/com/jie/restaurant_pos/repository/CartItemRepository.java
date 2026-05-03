package com.jie.restaurant_pos.repository;

import com.jie.restaurant_pos.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByOrderId(Long orderId);
    List<CartItem> findByOrderIdAndIsFinished(Long orderId, Byte isFinished);
    List<CartItem> findByOrderIdAndIsPending(Long orderId, Byte isPending);
    void deleteByOrderIdAndIsPending(Long orderId, Byte isPending);
    void deleteByOrderIdAndIsPendingIsNot(Long orderId, Byte isPending);
}
