package com.foodie1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne
    private FoodItem foodItem;
    private double price;
    @Column(name = "discount_price")
    private Double discountPrice;


    private int quantity;
    private String imageUrl;

    private String foodName;

    public String getFoodName() {
        if (foodName != null && !foodName.isEmpty()) {
            return foodName;
        }
        return foodItem != null ? foodItem.getName() : null;
    }
}
