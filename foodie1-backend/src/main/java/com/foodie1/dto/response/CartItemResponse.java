package com.foodie1.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long foodItemId;
    private String foodItemName;
    private String foodItemImage;
    private Double price;
    private Double discountPrice;
    private Integer quantity;
    private Double subtotal;
} 