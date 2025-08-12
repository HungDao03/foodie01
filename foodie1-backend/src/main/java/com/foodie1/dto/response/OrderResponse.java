package com.foodie1.dto.response;

import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {
    private Long id;
    private String status;
    private String statusLabel;
    private String foodName;
    private String orderTime;
    private String deliveryAddress;
    private String phoneNumber;
    private Double totalAmount;
    private String userName;
    private String paymentStatus;
    private String paymentMethod;
    private String notes;
    private double price;
    private double discountPrice;
    private int quantity;
    private String imageUrl;

    private List<OrderItemResponse> items;
}
