package com.foodie1.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    @Email(message = "Email không hợp lệ")
    private String email;
    private String fullName;
    private String phoneNumber;
    private String address;
    private String avatar;
    private String paymentMethod;

} 