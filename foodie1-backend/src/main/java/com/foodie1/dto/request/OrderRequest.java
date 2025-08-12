package com.foodie1.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.HashMap;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;
    private String notes;
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String deliveryAddress;
    private double price;
    private double discountPrice;
    private Double totalAmount;
    private String paymentStatus;
    @NotNull(message = "Món ăn không được để trống")
    private Long foodItemId;
    @NotNull(message = "Số lượng không được để trống")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
    private String imageUrl;
}