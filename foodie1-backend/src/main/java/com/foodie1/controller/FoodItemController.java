package com.foodie1.controller;

import com.foodie1.dto.request.FoodItemRequest;
import com.foodie1.dto.response.FoodItemResponse;
import com.foodie1.model.FoodItem;
import com.foodie1.model.Category;

import com.foodie1.service.category.CategoryService;
import com.foodie1.service.file.FileStorageService;
import com.foodie1.dto.mapper.EntityDtoMapper;
import com.foodie1.service.fooditem.IFoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/food-items")
public class FoodItemController {

    @Autowired
    private IFoodItemService foodItemService;

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private EntityDtoMapper mapper;

    @Value("${app.base-url}")
    private String baseUrl;

    @GetMapping
    public ResponseEntity<List<FoodItemResponse>> getFoodItems(@RequestParam(required = false) Long categoryId) {
        List<FoodItem> items = (categoryId != null)
                ? foodItemService.getFoodItemsByCategory(categoryId)
                : foodItemService.getAllFoodItems();
        List<FoodItemResponse> responses = items.stream().map(mapper::toFoodItemResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodItemResponse>> searchFoodItems(@RequestParam String keyword) {
        List<FoodItem> items = foodItemService.searchFoodItems(keyword);
        List<FoodItemResponse> responses = items.stream().map(mapper::toFoodItemResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItemResponse> addFoodItem(
            @RequestParam("name") String name,
            @RequestParam("price") double price,
            @RequestParam(value = "discountPrice", required = false) Double discountPrice,
            @RequestParam("restaurant") String restaurant,
            @RequestParam("deliveryTime") int deliveryTime,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        // Phần xử lý giữ nguyên
        FoodItemRequest req = new FoodItemRequest();
        req.setName(name);
        req.setPrice(price);
        req.setDiscountPrice(discountPrice != null ? discountPrice : 0.0);
        req.setRestaurant(restaurant);
        req.setDeliveryTime(deliveryTime);
        req.setCategoryId(categoryId);

        Category category = categoryService.findById(categoryId);
        FoodItem foodItem = mapper.toFoodItem(req, category);
        if (category == null) {
            return ResponseEntity.badRequest().body(null); // Hoặc return lỗi rõ ràng
        }

        if (image != null && !image.isEmpty()) {
            String filename = fileStorageService.saveFile(image, "food");
            foodItem.setImageUrl(baseUrl + "uploads/food/" + filename);
        }

        FoodItem saved = foodItemService.saveFoodItem(foodItem);
        return ResponseEntity.ok(mapper.toFoodItemResponse(saved));
    }


    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodItemResponse> updateFoodItem(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam("price") double price,
            @RequestParam(value = "discountPrice", required = false) Double discountPrice,
            @RequestParam("restaurant") String restaurant,
            @RequestParam("deliveryTime") int deliveryTime,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image", required = false) MultipartFile image
    ) {
        FoodItem existingFood = foodItemService.findById(id);
        if (existingFood == null) return ResponseEntity.notFound().build();

        existingFood.setName(name);
        existingFood.setPrice(price);
        existingFood.setDiscountPrice(discountPrice != null ? discountPrice : 0.0);
        existingFood.setRestaurant(restaurant);
        existingFood.setDeliveryTime(deliveryTime);

        Category category = categoryService.findById(categoryId);
        if (category != null) existingFood.setCategory(category);

        if (image != null && !image.isEmpty()) {
            if (existingFood.getImageUrl() != null) {
                String oldFilename = existingFood.getImageUrl().substring(existingFood.getImageUrl().lastIndexOf("/") + 1);
                fileStorageService.deleteFile(oldFilename, "food");
            }

            String filename = fileStorageService.saveFile(image, "food");
            existingFood.setImageUrl(baseUrl + "uploads/food/" + filename);
        }

        FoodItem updated = foodItemService.saveFoodItem(existingFood);
        return ResponseEntity.ok(mapper.toFoodItemResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteFoodItem(@PathVariable Long id) {
        try {
            FoodItem foodItem = foodItemService.findById(id);
            if (foodItem != null && foodItem.getImageUrl() != null) {
                String filename = foodItem.getImageUrl().substring(foodItem.getImageUrl().lastIndexOf("/") + 1);
                fileStorageService.deleteFile(filename, "food");
            }

            foodItemService.deleteFoodItem(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Thêm món ăn vào yêu thích (0 → 1)
    @PostMapping("/{id}/add-to-favorites")
    public ResponseEntity<FoodItemResponse> addToFavorites(@PathVariable Long id) {
        try {
            FoodItem foodItem = foodItemService.addToFavorites(id);
            return ResponseEntity.ok(mapper.toFoodItemResponse(foodItem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Bỏ món ăn khỏi yêu thích (1 → 0)
    @PostMapping("/{id}/remove-from-favorites")
    public ResponseEntity<FoodItemResponse> removeFromFavorites(@PathVariable Long id) {
        try {
            FoodItem foodItem = foodItemService.removeFromFavorites(id);
            return ResponseEntity.ok(mapper.toFoodItemResponse(foodItem));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Lấy danh sách tất cả món ăn yêu thích
    @GetMapping("/favorites")
    public ResponseEntity<List<FoodItemResponse>> getFavoriteFoodItems() {
        List<FoodItem> favoriteItems = foodItemService.getFavoriteFoodItems();
        List<FoodItemResponse> responses = favoriteItems.stream()
                .map(mapper::toFoodItemResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
}
