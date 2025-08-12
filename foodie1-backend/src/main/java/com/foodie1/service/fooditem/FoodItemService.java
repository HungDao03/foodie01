package com.foodie1.service.fooditem;

import com.foodie1.model.FoodItem;
import com.foodie1.repo.FoodItemRepository;
import com.foodie1.repo.OrderRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class FoodItemService implements IFoodItemService {
    @Autowired
    private FoodItemRepository foodItemRepository;
    
    @Autowired
    private OrderRepository orderRepository;

    public List<FoodItem> getAllFoodItems() {
        return foodItemRepository.findByDeletedFalse();
    }

    public List<FoodItem> getFoodItemsByCategory(Long categoryId) {
        return foodItemRepository.findByCategoryIdAndDeletedFalse(categoryId);
    }

    public List<FoodItem> searchFoodItems(String keyword) {
        return foodItemRepository.findByNameContainingIgnoreCaseAndDeletedFalse(keyword);
    }

    public FoodItem saveFoodItem(FoodItem foodItem) {
        return foodItemRepository.save(foodItem);
    }

    public void deleteFoodItem(Long id) {
        // Kiểm tra xem món ăn có trong đơn hàng nào không
        if (orderRepository.existsByFoodItemId(id)) {
            throw new RuntimeException("Không thể xóa món ăn này vì đang có trong đơn hàng!");
        }
        foodItemRepository.deleteById(id);
    }

    public FoodItem findById(Long id) {
        return foodItemRepository.findById(id).orElse(null);
    }

}