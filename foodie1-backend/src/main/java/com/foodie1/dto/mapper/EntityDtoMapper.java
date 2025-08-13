package com.foodie1.dto.mapper;

import com.foodie1.dto.request.*;
import com.foodie1.dto.response.*;
import com.foodie1.model.*;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class EntityDtoMapper {
    private final ModelMapper modelMapper = new ModelMapper();

    // Category
    public CategoryResponse toCategoryResponse(Category entity) {
        return modelMapper.map(entity, CategoryResponse.class);
    }
    public Category toCategory(CategoryRequest dto) {
        return modelMapper.map(dto, Category.class);
    }

    // FoodItem
    public FoodItemResponse toFoodItemResponse(FoodItem entity) {
        FoodItemResponse res = modelMapper.map(entity, FoodItemResponse.class);
        if (entity.getCategory() != null) {
            res.setCategoryName(entity.getCategory().getName());
        }
        return res;
    }
    public FoodItem toFoodItem(FoodItemRequest dto, Category category) {
        FoodItem food = modelMapper.map(dto, FoodItem.class);
        food.setId(null); // Ngăn Hibernate hiểu nhầm là UPDATE
        food.setCategory(category);
        return food;
    }

    // User
    public UserResponse toUserResponse(User entity) {
        UserResponse res = modelMapper.map(entity, UserResponse.class);

        if (entity.getRoles() != null) {
            res.setRoles(entity.getRoles().stream()
                    .map(Role::getName)
                    .collect(java.util.stream.Collectors.toSet()));
        }

        if (entity.getPaymentMethod() != null) {
            res.setPaymentMethod(entity.getPaymentMethod().name());
        }

        // getVerified() đã được đảm bảo an toàn, không bao giờ trả về null
        // Không cần kiểm tra null nữa

        return res;
    }
    public User toUser(UserRegisterRequest dto) {
        return modelMapper.map(dto, User.class);
    }

    // Order
    public OrderResponse toOrderResponse(Order entity) {
        OrderResponse res = modelMapper.map(entity, OrderResponse.class);

        if (entity.getUser() != null) {
            res.setUserName(entity.getUser().getUsername());
        }

        if (entity.getItems() != null) {
            List<OrderItemResponse> itemResponses = entity.getItems().stream()
                    .map(item -> {
                        OrderItemResponse dto = new OrderItemResponse();
                        dto.setFoodName(item.getFoodName());
                        dto.setPrice(item.getPrice());
                        dto.setDiscountPrice(item.getDiscountPrice() != null ? item.getDiscountPrice() : 0.0);
                        dto.setQuantity(item.getQuantity());
                        dto.setImageUrl(item.getImageUrl());
                        return dto;
                    })
                    .toList();
            res.setItems(itemResponses);
            // ✅ Set status Enum và statusLabel nếu có
            if (entity.getStatus() != null) {
                res.setStatus(entity.getStatus().name());
                res.setStatusLabel(entity.getStatus().getLabel());
            }
        }

        return res;
    }
    // Không mapping OrderRequest -> Order trực tiếp vì cần set user, foodItem từ service
} 