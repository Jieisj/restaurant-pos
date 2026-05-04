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
    private final CartItemService cartItemService;

    @GetMapping
    public List<CartItem> getAllCartItems() {
        return cartItemService.getAllCartItems();
    }

    @GetMapping("/{id}")
    public CartItem getCartItemById(@PathVariable Long id) {
        return cartItemService.getCartItemById(id);
    }

    @GetMapping("/order/{orderId}")
    public List<CartItem> getCartItemsByOrderId(@PathVariable Long orderId) {
        return cartItemService.getCartItemsByOrderId(orderId);
    }

    @PostMapping
    public CartItem createCartItem(@RequestBody CartItem cartItem) {
        return cartItemService.createCartItem(cartItem);
    }

    @PutMapping("/{id}")
    public CartItem updateCartItem(
            @PathVariable Long id,
            @RequestBody CartItem cartItem
    ) {
        return cartItemService.updateCartItem(id, cartItem);
    }

    @PutMapping("/{id}/send")
    public CartItem sendCartItem(@PathVariable Long id) {
        return cartItemService.sendCartItem(id);
    }

    @PutMapping("/{id}/finish")
    public CartItem finishCartItem(@PathVariable Long id) {
        return cartItemService.finishCartItem(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCartItem(@PathVariable Long id) {
        cartItemService.deleteCartItem(id);
    }
}
