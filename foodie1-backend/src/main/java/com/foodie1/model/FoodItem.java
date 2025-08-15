package com.foodie1.model;

import com.foodie1.model.Category;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Entity đại diện cho một món ăn trong hệ thống
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "food_items")
public class FoodItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;        // Tên món ăn
    private double price;       // Giá gốc
    
    @Column(name = "discount_price")
    private double discountPrice;   // Giá khuyến mãi
    
    @Column(name = "delivery_time")
    private int deliveryTime;       // Thời gian giao hàng (phút)
    
    private String restaurant;      // Tên nhà hàng
    
    @ManyToOne
    private Category category;      // Danh mục món ăn (VD: Đồ ăn, Đồ uống)
    
    @Column(name = "image_url")
    private String imageUrl;        // Đường dẫn ảnh món ăn
    
    @Column(nullable = false)
    private boolean deleted = false;    // Trạng thái xóa mềm

    @Column(name = "favorite", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Integer favorite = 0;      // Trạng thái yêu thích (0 = false, 1 = true)

    // Method getter cho Integer - null → 0
    public Integer getFavorite() {
        return favorite != null ? favorite : 0;
    }

    // Method setter cho Integer - null → 0
    public void setFavorite(Integer favorite) {
        this.favorite = favorite != null ? favorite : 0;
    }

    // Method để kiểm tra boolean - null → false
    public boolean isFavorite() {
        return favorite != null && favorite.equals(1);
    }

    // Method để set trực tiếp boolean - true → 1, false → 0
    public void setFavorite(boolean favorite) {
        this.favorite = favorite ? 1 : 0;
    }

    // Method để toggle trạng thái yêu thích
    public void toggleFavorite() {
        this.favorite = (this.favorite != null && this.favorite.equals(1)) ? 0 : 1;
    }
}