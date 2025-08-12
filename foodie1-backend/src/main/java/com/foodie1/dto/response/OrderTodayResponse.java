package com.foodie1.dto.response;

import com.foodie1.model.OrderStatus;
import com.foodie1.model.PaymentMethod;
import com.foodie1.model.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderTodayResponse {
    private Long id;
    private String orderTime;
    private String deliveryAddress;
    private String phoneNumber;
    private Double totalAmount;
    private PaymentStatus paymentStatus;
    private PaymentMethod paymentMethod;
    private String username;
    private String avatar;
    private String foodItemName;
    private OrderStatus status;

    private java.util.List<OrderItemResponse> items;



}
