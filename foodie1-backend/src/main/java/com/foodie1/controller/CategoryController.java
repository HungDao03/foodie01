package com.foodie1.controller;

import com.foodie1.dto.request.CategoryRequest;
import com.foodie1.dto.response.CategoryResponse;
import com.foodie1.dto.response.FoodItemResponse;
import com.foodie1.model.Category;
import com.foodie1.model.FoodItem;
import com.foodie1.service.category.CategoryService;
import com.foodie1.dto.mapper.EntityDtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private EntityDtoMapper mapper;

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getCategories() {
        List<Category> categories = categoryService.getAllCategories();
        List<CategoryResponse> responses = categories.stream().map(mapper::toCategoryResponse).collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addCategory(@Valid @RequestBody CategoryRequest request) {
        Category existing = categoryService.findByName(request.getName());
        if (existing != null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Danh mục đã tồn tại với tên: " + request.getName());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(error); // dùng mã 409
        }

        Category category = mapper.toCategory(request);
        Category saved = categoryService.saveCategory(category);
        return ResponseEntity.ok(mapper.toCategoryResponse(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException ex) {
            Map<String, String> error = new HashMap<>();
            error.put("message", ex.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

}