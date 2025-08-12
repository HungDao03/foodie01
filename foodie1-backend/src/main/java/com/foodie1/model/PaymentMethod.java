package com.foodie1.model;

public enum PaymentMethod {
    COD("Thanh toán khi nhận hàng"),
    ONLINE("Thanh toán trực tuyến");
    private final String label;
    PaymentMethod(String label) {
        this.label = label;
    }
}
