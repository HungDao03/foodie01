package com.foodie1.service.cart;

import com.foodie1.dto.request.CartItemRequest;
import com.foodie1.dto.response.CartResponse;
import com.foodie1.model.Cart;

import java.util.List;

public interface ICartService {
    CartResponse getCartByUserId(Long userId);
    CartResponse addItemToCart(Long userId, CartItemRequest request);
    CartResponse updateCartItemQuantity(Long userId, Long foodItemId, Integer quantity);
    CartResponse removeItemFromCart(Long userId, Long foodItemId);
    CartResponse clearCart(Long userId);
//    CartResponse removeSelectedItems(Long userId, List<Long> foodItemIds);
    CartResponse removeSelectedItemsByCartItemIds(Long userId, List<Long> cartItemIds);
} 