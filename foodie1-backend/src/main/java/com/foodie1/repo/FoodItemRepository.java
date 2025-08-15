package com.foodie1.repo;

import com.foodie1.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {

    List<FoodItem> findByDeletedFalse();

    List<FoodItem> findByCategoryIdAndDeletedFalse(Long categoryId);

    boolean existsByCategoryId(Long categoryId);

    List<FoodItem> findByNameContainingIgnoreCaseAndDeletedFalse(String name);

    // Tìm tất cả món ăn yêu thích (favorite = 1)
    List<FoodItem> findByFavoriteAndDeletedFalse(Integer favorite);
}