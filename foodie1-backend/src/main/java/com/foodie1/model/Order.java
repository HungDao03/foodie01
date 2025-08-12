package com.foodie1.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;
    @ManyToOne
    private FoodItem foodItem;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL)
    private List<OrderItem> items = new ArrayList<>();

    private Integer quantity;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    @Column(name = "order_time")
    private String orderTime;

    @OneToMany(mappedBy = "order")
    private List<OrderItem> orderItems;
    
    @Column(name = "delivery_address")
    private String deliveryAddress;
    
    @Column(name = "phone_number")
    private String phoneNumber;

    
    @Column(name = "total_amount")
    private Double totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(name = "notes")
    private String notes;

    private double price;

    @Column(name = "discount_price")
    private double discountPrice;   // Giá khuyến mãi

    private String imageUrl; // URL hình ảnh của món ăn
}