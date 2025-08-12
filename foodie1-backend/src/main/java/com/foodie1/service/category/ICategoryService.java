package com.foodie1.service.category;


import com.foodie1.model.Category;
import com.foodie1.service.IGenericService;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ICategoryService extends IGenericService<Category> {
    void deleteCategory(Long id);
    @Query("SELECT CASE WHEN COUNT(ci) > 0 THEN true ELSE false END FROM CartItem ci WHERE ci.foodItem.category.id = :categoryId")
    boolean existsByFoodItemCategoryId(@Param("categoryId") Long categoryId);
}