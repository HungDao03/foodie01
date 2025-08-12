package com.foodie1.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemResponse {
    private String foodName;
    private double price;
    private int quantity;
    private String imageUrl;
    private double discountPrice;
}
