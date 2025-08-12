package com.foodie1.model;

public enum PaymentStatus {
    NOT_PAID("Chưa thanh toán"),
    PAID("Đã thanh toán");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}