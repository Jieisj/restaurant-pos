package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.CartItem;
import com.jie.restaurant_pos.service.CartItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin
@RequiredArgsConstructor
public class CartItemController {
    public CartItemService service;

    @GetMapping("/order/{orderId}")
    public List<CartItem> getItemsByOrderId(@PathVariable Long orderId) {
        return service.getItemsByOrderId(orderId);
    }

    @GetMapping("/order/{orderId}/pending")
    public List<CartItem> getPendingItemsByOrderId(@PathVariable Long orderId) {
        return service.getPendingItemsByOrderId(orderId);
    }

    @GetMapping("/order/{orderId}/not-pending")
    public List<CartItem> getNotPendingItemsByOrderId(@PathVariable Long orderId) {
        return service.getNotPendingItemsByOrderId(orderId);
    }

    @GetMapping("/order/{orderId}/finished")
    public List<CartItem> getFinishedItemsByOrderId(@PathVariable Long orderId) {
        return service.getFinishedItemsByOrderId(orderId);
    }

    @GetMapping("/order/{orderId}/not-finished")
    public List<CartItem> getNotFinishedItemsByOrderId(@PathVariable Long orderId) {
        return service.getNotFinishedItemsByOrderId(orderId);
    }

    @PostMapping
    public CartItem addCartItem(@RequestBody CartItem cartItem) {
        return service.addCartItem(cartItem);
    }

    @PutMapping("/{id}")
    public CartItem updateCartItem(
            @PathVariable Long id,
            @RequestBody CartItem cartItem
    ) {
        return service.updateCartItem(id, cartItem);
    }

    @DeleteMapping("/{id}")
    public void deleteCartItem(@PathVariable Long id) {
        service.deleteCartItem(id);
    }

    @DeleteMapping("/order/{orderId}/pending")
    public void deletePendingItemsByOrderId(@PathVariable Long orderId) {
        service.deletePendingItemsByOrderId(orderId);
    }

    @DeleteMapping("/order/{orderId}/not-pending")
    public void deleteNotPendingItemsByOrderId(@PathVariable Long orderId) {
        service.deleteNotPendingItemsByOrderId(orderId);
    }
}
