package com.foodie1.service.category;

import com.foodie1.model.Category;
import com.foodie1.repo.CartItemRepository;
import com.foodie1.repo.CategoryRepository;
import com.foodie1.repo.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService implements ICategoryService {
    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private FoodItemRepository foodItemRepository;
    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category findByName(String name) {
        return categoryRepository.findByName(name);
    }

    @Override
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Override
    public Category findById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public void delete(Category category) {
        categoryRepository.delete(category);
    }




    public void deleteCategory(Long categoryId) {
        boolean isInFoodItems = foodItemRepository.existsByCategoryId(categoryId);
        boolean isInCart = cartItemRepository.existsByFoodItem_Category_Id(categoryId);

        if (isInFoodItems || isInCart) {
            throw new IllegalStateException("Không thể xóa danh mục đang được sử dụng.");
        }

        categoryRepository.deleteById(categoryId);
    }

    @Override
    public boolean existsByFoodItemCategoryId(Long categoryId) {
        // Kiểm tra xem có món ăn nào dùng category này không
        boolean isInFoodItems = foodItemRepository.existsByCategoryId(categoryId);

        // Kiểm tra xem có giỏ hàng nào có món ăn thuộc category này không (nếu có)
        boolean isInCart = cartItemRepository.existsByFoodItem_Category_Id(categoryId);

        return isInFoodItems || isInCart;
    }
}