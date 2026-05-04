package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.CartItem;
import com.jie.restaurant_pos.entity.MenuItem;
import com.jie.restaurant_pos.repository.CartItemRepository;
import com.jie.restaurant_pos.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemService {
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;

    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }

    public List<CartItem> getCartItemsByOrderId(Long orderId) {
        return cartItemRepository.findByOrderId(orderId);
    }

    public CartItem getCartItemById(Long id) {
        return cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found: " + id));
    }

    public CartItem createCartItem(CartItem cartItem) {
        MenuItem menuItem = menuItemRepository.findById(cartItem.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        cartItem.setNameSnapshot(menuItem.getName());
        cartItem.setPriceSnapshot(menuItem.getPrice());

        cartItem.setIsPending((byte) 1);
        cartItem.setIsFinished((byte) 0);

        cartItem.setCreatedAt(LocalDateTime.now());

        return cartItemRepository.save(cartItem);
    }

    public CartItem updateCartItem(Long id, CartItem updated) {
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (updated.getQuantity() != null) {
            item.setQuantity(updated.getQuantity());
        }

        if (updated.getNameSnapshot() != null) {
            item.setNameSnapshot(updated.getNameSnapshot());
        }

        if (updated.getPriceSnapshot() != null) {
            item.setPriceSnapshot(updated.getPriceSnapshot());
        }

        if (updated.getIsPending() != null) {
            item.setIsPending(updated.getIsPending());
        }

        if (updated.getIsFinished() != null) {
            item.setIsFinished(updated.getIsFinished());
        }

        return cartItemRepository.save(item);
    }

    public CartItem sendCartItem(Long id) {
        CartItem item = getCartItemById(id);
        item.setIsPending((byte) 0);
        item.setSentAt(LocalDateTime.now());
        return cartItemRepository.save(item);
    }

    public CartItem finishCartItem(Long id) {
        CartItem item = getCartItemById(id);
        item.setIsFinished((byte) 1);
        item.setIsPending((byte) 0);
        item.setFinishedAt(LocalDateTime.now());
        return cartItemRepository.save(item);
    }

    public void deleteCartItem(Long id) {
        cartItemRepository.deleteById(id);
    }
}
