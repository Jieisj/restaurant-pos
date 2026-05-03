package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.CartItem;
import com.jie.restaurant_pos.repository.CartItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemService {
    private final CartItemRepository repository;

    public List<CartItem> getItemsByOrderId(Long orderId) {
        return repository.findByOrderId(orderId);
    }

    public List<CartItem> getPendingItemsByOrderId(Long orderId) {
        return repository.findByOrderIdAndIsPending(orderId, (byte) 1);
    }

    public List<CartItem> getNotPendingItemsByOrderId(Long orderId) {
        return repository.findByOrderIdAndIsPending(orderId, (byte) 0);
    }

    public List<CartItem> getFinishedItemsByOrderId(Long orderId) {
        return repository.findByOrderIdAndIsFinished(orderId, (byte) 1);
    }

    public List<CartItem> getNotFinishedItemsByOrderId(Long orderId) {
        return repository.findByOrderIdAndIsFinished(orderId, (byte) 0);
    }


    public CartItem addCartItem(CartItem cartItem) {
        return repository.save(cartItem);
    }

    public CartItem updateCartItem(Long id, CartItem updatedItem) {
        CartItem item = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        item.setQuantity(updatedItem.getQuantity());
        item.setNameSnapshot(updatedItem.getNameSnapshot());
        item.setPriceSnapshot(updatedItem.getPriceSnapshot());
        item.setIsPending(updatedItem.getIsPending());
        item.setIsFinished(updatedItem.getIsFinished());
        item.setSentAt(updatedItem.getSentAt());
        item.setFinishedAt(updatedItem.getFinishedAt());

        return repository.save(item);
    }

    public void deleteCartItem(Long id) {
        repository.deleteById(id);
    }

    public void deletePendingItemsByOrderId(Long orderId) {
        repository.deleteByOrderIdAndIsPending(orderId, (byte) 1);
    }

    public void deleteNotPendingItemsByOrderId(Long orderId) {
        repository.deleteByOrderIdAndIsPendingIsNot(orderId, (byte) 0);
    }

}
