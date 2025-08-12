package com.foodie1.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> cartItems;
    private Double totalAmount;
    private Integer totalItems;
} 