package com.jie.restaurant_pos.service;

import com.jie.restaurant_pos.entity.CartItem;
import com.jie.restaurant_pos.entity.CartItemNote;
import com.jie.restaurant_pos.entity.MenuItem;
import com.jie.restaurant_pos.repository.CartItemNoteRepository;
import com.jie.restaurant_pos.repository.CartItemRepository;
import com.jie.restaurant_pos.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CartItemService {
    private final CartItemRepository cartItemRepository;
    private final CartItemNoteRepository cartItemNoteRepository;
    private final MenuItemRepository menuItemRepository;
    private final OrderService orderService;

    public List<CartItem> getAllCartItems() {
        return cartItemRepository.findAll();
    }

    public List<CartItem> getNotFinishedItemsByOrderId(Long orderId) {
        return cartItemRepository.findByOrderIdAndIsPendingAndIsFinished(
                orderId,
                (byte) 0,
                (byte) 0
        );
    }

    public List<CartItem> getAllNotFinishedItems() {
        return cartItemRepository.findByIsPendingAndIsFinished(
                (byte) 0,
                (byte) 0
        );
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

        Long orderId = cartItem.getOrderId();
        CartItem savedItem = cartItemRepository.save(cartItem);
        orderService.recalculateOrderTotal(orderId);

        return savedItem;
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

        Long orderId = item.getOrderId();
        CartItem savedItem = cartItemRepository.save(item);
        orderService.recalculateOrderTotal(orderId);

        return savedItem;
    }

    public CartItem sendCartItem(Long id) {
        CartItem item = getCartItemById(id);
        item.setIsPending((byte) 0);
        item.setIsFinished((byte) 0);
        item.setSentAt(LocalDateTime.now());
        item.setFinishedAt(null);
        return cartItemRepository.save(item);
    }

    public CartItem finishCartItem(Long id) {
        CartItem item = getCartItemById(id);
        item.setIsFinished((byte) 1);
        item.setIsPending((byte) 0);
        item.setFinishedAt(LocalDateTime.now());
        return cartItemRepository.save(item);
    }

    public CartItem revertFinishedCartItem(Long id) {
        CartItem item = getCartItemById(id);
        item.setIsFinished((byte) 0);
        item.setIsPending((byte) 0);
        item.setFinishedAt(null);
        return cartItemRepository.save(item);
    }

    public void deleteCartItem(Long id) {
        CartItem item = cartItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        Long orderId = item.getOrderId();
        cartItemRepository.delete(item);
        orderService.recalculateOrderTotal(orderId);
    }

    public List<CartItemNote> getCartItemNotes(Long cartItemId) {
        return cartItemNoteRepository.findByCartItemId(cartItemId);
    }

    public CartItemNote createCartItemNote(Long cartItemId, CartItemNote note) {
        CartItem item = getCartItemById(cartItemId);
        note.setCartItemId(cartItemId);
        if (note.getPrice() == null) {
            note.setPrice(BigDecimal.ZERO);
        }

        CartItemNote savedNote = cartItemNoteRepository.save(note);
        orderService.recalculateOrderTotal(item.getOrderId());
        return savedNote;
    }

    public CartItemNote updateCartItemNote(Long noteId, CartItemNote updated) {
        CartItemNote note = cartItemNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Cart item note not found"));

        if (updated.getNote() != null) {
            note.setNote(updated.getNote());
        }

        if (updated.getPrice() != null) {
            note.setPrice(updated.getPrice());
        }

        CartItemNote savedNote = cartItemNoteRepository.save(note);
        CartItem item = getCartItemById(savedNote.getCartItemId());
        orderService.recalculateOrderTotal(item.getOrderId());
        return savedNote;
    }

    public void deleteCartItemNote(Long noteId) {
        CartItemNote note = cartItemNoteRepository.findById(noteId)
                .orElseThrow(() -> new RuntimeException("Cart item note not found"));
        Long orderId = cartItemRepository.findOrderIdById(note.getCartItemId())
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        cartItemNoteRepository.deleteByIdDirect(noteId);
        orderService.recalculateOrderTotal(orderId);
    }
}
