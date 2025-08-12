package com.foodie1.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FoodItemRequest {

    @NotBlank(message = "Tên món ăn không được để trống")
    private String name;
    @Min(value = 1, message = "Giá phải lớn hơn 0")
    private double price;
    private double discountPrice;
    private int deliveryTime;
    @NotBlank(message = "Tên nhà hàng không được để trống")
    private String restaurant;
    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;
    private String imageUrl;

}