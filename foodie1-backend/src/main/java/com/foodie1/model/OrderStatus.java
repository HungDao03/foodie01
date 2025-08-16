package com.foodie1.model;

import java.util.Arrays;

public enum OrderStatus {
    CONFIRMED("Đã xác nhận"),
    DELIVERED("Đã giao hàng"),
    CANCELLED("Đã hủy");

    private final String label;
    OrderStatus(String label) {
        this.label = label;
    }
    public String getLabel() {
        return label;
    }
    public static OrderStatus fromString(String status) {
        return Arrays.stream(OrderStatus.values())
                .filter(s -> s.name().equalsIgnoreCase(status))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid status: " + status));
    }
}
