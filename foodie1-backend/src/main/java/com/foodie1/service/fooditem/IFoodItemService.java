package com.foodie1.service.fooditem;

import com.foodie1.model.FoodItem;

import java.util.List;

public interface IFoodItemService {
    List<FoodItem> getAllFoodItems();
    List<FoodItem> getFoodItemsByCategory(Long categoryId);
    List<FoodItem> searchFoodItems(String keyword);
    FoodItem saveFoodItem(FoodItem foodItem);
    void deleteFoodItem(Long id);
    FoodItem findById(Long id);
}