package com.foodie1.controller;

import com.foodie1.dto.request.CartItemRequest;
import com.foodie1.dto.response.CartResponse;
import com.foodie1.service.cart.ICartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private ICartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponse> getCart(@PathVariable Long userId) {
        try {
            CartResponse cart = cartService.getCartByUserId(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<CartResponse> addItemToCart(
            @PathVariable Long userId,
            @RequestBody CartItemRequest request) {
        try {
            CartResponse cart = cartService.addItemToCart(userId, request);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{userId}/update/{foodItemId}")
    public ResponseEntity<CartResponse> updateCartItemQuantity(
            @PathVariable Long userId,
            @PathVariable Long foodItemId,
            @RequestParam Integer quantity) {
        try {
            CartResponse cart = cartService.updateCartItemQuantity(userId, foodItemId, quantity);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}/remove/{foodItemId}")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @PathVariable Long userId,
            @PathVariable Long foodItemId) {
        try {
            CartResponse cart = cartService.removeItemFromCart(userId, foodItemId);
            System.out.println("CartResponse: " + cart);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{userId}/clear")
    public ResponseEntity<CartResponse> clearCart(@PathVariable Long userId) {
        try {
            CartResponse cart = cartService.clearCart(userId);
            return ResponseEntity.ok(cart);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

//    @DeleteMapping("/{userId}/remove-selected")
//    public ResponseEntity<CartResponse> removeSelectedItems(
//            @PathVariable Long userId,
//            @RequestBody List<Long> foodItemIds) {
//        try {
//            CartResponse cart = cartService.removeSelectedItems(userId, foodItemIds);
//            return ResponseEntity.ok(cart);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().build();
//        }
//    }
@DeleteMapping("/{userId}/remove-selected")
public ResponseEntity<CartResponse> removeSelectedItems(
        @PathVariable Long userId,
        @RequestBody List<Long> cartItemIds) {
    try {
        System.out.println("Removing cartItemIds for userId " + userId + ": " + cartItemIds);
        CartResponse cart = cartService.removeSelectedItemsByCartItemIds(userId, cartItemIds);
        return ResponseEntity.ok(cart);
    } catch (Exception e) {
        System.err.println("Error removing items: " + e.getMessage());
        return ResponseEntity.badRequest().build();
    }
}

} 