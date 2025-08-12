package com.foodie1.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodItemResponse {
    private Long id;
    private String name;
    private double price;
    private double discountPrice;
    private int deliveryTime;
    private String restaurant;
    private String categoryName;
    private String imageUrl;


} 