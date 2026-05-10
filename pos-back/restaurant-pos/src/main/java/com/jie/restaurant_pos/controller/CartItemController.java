package com.jie.restaurant_pos.controller;

import com.jie.restaurant_pos.entity.CartItem;
import com.jie.restaurant_pos.entity.CartItemNote;
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

    @GetMapping("/notFinished")
    public List<CartItem> getAllNotFinishedItems() {
        return cartItemService.getAllNotFinishedItems();
    }

    @GetMapping("/order/{orderId}/notFinished")
    public List<CartItem> getNotFinishedByTableId(@PathVariable Long orderId){
        return cartItemService.getNotFinishedItemsByOrderId(orderId);
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

    @PutMapping("/{id}/revert-finish")
    public CartItem revertFinishedCartItem(@PathVariable Long id) {
        return cartItemService.revertFinishedCartItem(id);
    }

    @DeleteMapping("/{id}")
    public void deleteCartItem(@PathVariable Long id) {
        cartItemService.deleteCartItem(id);
    }

    @GetMapping("/{cartItemId}/notes")
    public List<CartItemNote> getCartItemNotes(@PathVariable Long cartItemId) {
        return cartItemService.getCartItemNotes(cartItemId);
    }

    @PostMapping("/{cartItemId}/notes")
    public CartItemNote createCartItemNote(
            @PathVariable Long cartItemId,
            @RequestBody CartItemNote note
    ) {
        return cartItemService.createCartItemNote(cartItemId, note);
    }

    @PutMapping("/notes/{noteId}")
    public CartItemNote updateCartItemNote(
            @PathVariable Long noteId,
            @RequestBody CartItemNote note
    ) {
        return cartItemService.updateCartItemNote(noteId, note);
    }

    @DeleteMapping("/notes/{noteId}")
    public void deleteCartItemNote(@PathVariable Long noteId) {
        cartItemService.deleteCartItemNote(noteId);
    }
}
