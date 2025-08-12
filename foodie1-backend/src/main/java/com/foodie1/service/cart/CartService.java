package com.foodie1.service.cart;

import com.foodie1.dto.request.CartItemRequest;
import com.foodie1.dto.request.OrderRequestDTO;
import com.foodie1.dto.response.CartItemResponse;
import com.foodie1.dto.response.CartResponse;
import com.foodie1.model.*;
import com.foodie1.repo.*;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService implements ICartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public CartResponse getCartByUserId(Long userId) {
        Cart cart = getOrCreateCart(userId);
        return convertToCartResponse(cart);
    }

    @Override
    public CartResponse addItemToCart(Long userId, CartItemRequest request) {
        Cart cart = getOrCreateCart(userId);
        FoodItem foodItem = foodItemRepository.findById(request.getFoodItemId())
                .orElseThrow(() -> new RuntimeException("Food item not found"));

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), request.getFoodItemId());
        
        if (existingItem.isPresent()) {
            // Update quantity if item already exists
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Add new item to cart
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setFoodItem(foodItem);
            cartItem.setQuantity(request.getQuantity());
            cartItemRepository.save(cartItem);
        }

        return convertToCartResponse(cart);
    }

    @Override
    public CartResponse updateCartItemQuantity(Long userId, Long foodItemId, Integer quantity) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findByCartIdAndFoodItemId(cart.getId(), foodItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return convertToCartResponse(cart);
    }

    @Override
    public CartResponse removeItemFromCart(Long userId, Long foodItemId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartIdAndFoodItemId(cart.getId(), foodItemId);
        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return convertToCartResponse(updatedCart);
    }

    // xoa mon an theo cartiteam
    @Override
    public CartResponse removeSelectedItemsByCartItemIds(Long userId, List<Long> cartItemIds) {
        Cart cart = getOrCreateCart(userId);
        if (cartItemIds == null || cartItemIds.isEmpty()) {
            throw new IllegalArgumentException("cartItemIds cannot be empty");
        }

        int deletedCount = 0;
        for (Long cartItemId : cartItemIds) {
            Optional<CartItem> cartItemOptional = cartItemRepository.findById(cartItemId);
            System.out.println("Checking cartItemId: " + cartItemId + ", Exists: " + cartItemOptional.isPresent());
            if (cartItemOptional.isPresent()) {
                CartItem cartItem = cartItemOptional.get();
                System.out.println("Cart ID from CartItem: " + cartItem.getCart().getId() + ", Cart ID from Cart: " + cart.getId());
                if (cartItem.getCart().getId().equals(cart.getId())) {
                    entityManager.remove(cartItem); // Xóa entity quản lý
                    deletedCount++;
                    System.out.println("Successfully removed cartItemId: " + cartItemId);
                    // Kiểm tra lại sau xóa
                    Optional<CartItem> checkItem = cartItemRepository.findById(cartItemId);
                    System.out.println("After removal, cartItemId " + cartItemId + " exists: " + checkItem.isPresent());
                } else {
                    System.out.println("cartItemId " + cartItemId + " does not belong to this cart");
                }
            }
        }

        if (deletedCount == 0) {
            throw new IllegalStateException("No cart items found or deleted for the given cartItemIds");
        }

        // Làm mới Cart và flush để đảm bảo thay đổi
        cart = cartRepository.findById(cart.getId())
                .orElseThrow(() -> new IllegalStateException("Cart not found after deletion"));
        entityManager.flush(); // Đảm bảo commit ngay lập tức
        return convertToCartResponse(cart);
    }
    @Override
    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreateCart(userId);
        cartItemRepository.deleteByCartId(cart.getId());
        Cart updatedCart = cartRepository.findById(cart.getId()).orElse(cart);
        return convertToCartResponse(updatedCart);
    }


    private Cart getOrCreateCart(Long userId) {
        Optional<Cart> existingCart = cartRepository.findByUserId(userId);
        if (existingCart.isPresent()) {
            return existingCart.get();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart newCart = new Cart();
        newCart.setUser(user);
        return cartRepository.save(newCart);
    }

    private CartResponse convertToCartResponse(Cart cart) {
        List<CartItemResponse> cartItemResponses = cart.getCartItems().stream()
                .map(this::convertToCartItemResponse)
                .collect(Collectors.toList());

        double totalAmount = cartItemResponses.stream()
                .mapToDouble(CartItemResponse::getSubtotal)
                .sum();

        int totalItems = cartItemResponses.stream()
                .mapToInt(CartItemResponse::getQuantity)
                .sum();

        return new CartResponse(
                cart.getId(),
                cart.getUser().getId(),
                cartItemResponses,
                totalAmount,
                totalItems
        );
    }

    private CartItemResponse convertToCartItemResponse(CartItem cartItem) {
        FoodItem foodItem = cartItem.getFoodItem();
        double subtotal = cartItem.getSubtotal();
        return new CartItemResponse(
                cartItem.getId(),
                foodItem.getId(),
                foodItem.getName(),
                foodItem.getImageUrl(),
                foodItem.getPrice(),
                foodItem.getDiscountPrice(),
                cartItem.getQuantity(),
                subtotal
        );
    }

} 