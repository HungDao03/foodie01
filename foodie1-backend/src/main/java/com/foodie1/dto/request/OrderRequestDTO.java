package com.foodie1.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequestDTO {
    @NotEmpty(message = "Danh sách món ăn không được để trống")
    private List<Long> cartItemIds;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String deliveryAddress;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phoneNumber;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;

    private String notes;
}
