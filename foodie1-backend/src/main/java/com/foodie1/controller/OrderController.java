package com.foodie1.controller;

import com.foodie1.config.service.EmailService;
import com.foodie1.dto.request.OrderRequest;
import com.foodie1.dto.request.OrderRequestDTO;
import com.foodie1.dto.request.StatusUpdateRequest;
import com.foodie1.dto.response.OrderResponse;
import com.foodie1.dto.response.OrderTodayResponse;
import com.foodie1.model.*;
import com.foodie1.service.cart.CartService;
import com.foodie1.service.fooditem.IFoodItemService;
import com.foodie1.service.order.OrderService;
import com.foodie1.service.user.IUserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import com.foodie1.dto.mapper.EntityDtoMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;
    @Autowired
    private IUserService userService;
    @Autowired
    private IFoodItemService foodItemService;
    @Autowired
    private EntityDtoMapper mapper;
    @Autowired
    private CartService cartService;
    @Autowired
    private EmailService emailService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponse> placeOrder(@Valid @RequestBody OrderRequest orderRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        FoodItem foodItem = foodItemService.findById(orderRequest.getFoodItemId());
        if (user == null || foodItem == null) {
            return ResponseEntity.badRequest().build(); // trả về lỗi 400
        }

        Order order = new Order();
        order.setUser(user);
        order.setFoodItem(foodItem);
        order.setQuantity(orderRequest.getQuantity());
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        order.setPhoneNumber(orderRequest.getPhoneNumber());
        order.setPaymentMethod(PaymentMethod.valueOf(orderRequest.getPaymentMethod().toUpperCase()));
        order.setPaymentStatus(PaymentStatus.valueOf(orderRequest.getPaymentStatus().toUpperCase()));
        order.setNotes(orderRequest.getNotes());
        order.setTotalAmount(orderRequest.getTotalAmount());
        order.setImageUrl(foodItem.getImageUrl());
        order.setPrice(orderRequest.getPrice() > 0 ? orderRequest.getPrice() : foodItem.getPrice());
        order.setDiscountPrice(orderRequest.getDiscountPrice() > 0 ? orderRequest.getDiscountPrice() : foodItem.getDiscountPrice());
        Order saved = orderService.placeOrder(order);
        emailService.sendOrderConfirmationEmail(user, saved);
        emailService.sendAdminNotificationEmail(saved);
        return ResponseEntity.ok(mapper.toOrderResponse(saved));
    }

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<OrderResponse>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        List<OrderResponse> responses = orders.stream().map(mapper::toOrderResponse)
                                                       .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PatchMapping("/{id}/payment-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updatePaymentStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request) {
        Order order = orderService.updatePaymentStatus(id, request.getStatus());
        if (order == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(mapper.toOrderResponse(order));
    }

    @PostMapping("/checkout")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<OrderResponse> checkoutOrder(@RequestBody OrderRequestDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        Order order = orderService.createOrderFromCartItems(user, request);
        emailService.sendOrderConfirmationEmail(user, order);
        emailService.sendAdminNotificationEmail(order);
        return ResponseEntity.ok(mapper.toOrderResponse(order));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {
        List<Order> orders = orderService.findAll();
        List<OrderResponse> responses = orders.stream()
                .map(mapper::toOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        Order order = orderService.findById(id);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        orderService.delete(order);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateOrder(@PathVariable Long id, @RequestBody OrderRequest request) {
        Order existingOrder = orderService.findById(id);
        if (existingOrder == null) {
            return ResponseEntity.notFound().build();
        }

        // cập nhật các trường cần thiết
        existingOrder.setDeliveryAddress(request.getDeliveryAddress());
        existingOrder.setPhoneNumber(request.getPhoneNumber());
        existingOrder.setNotes(request.getNotes());
        existingOrder.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        existingOrder.setQuantity(request.getQuantity());
        existingOrder.setTotalAmount(request.getTotalAmount());
        existingOrder.setPrice(request.getPrice());
        existingOrder.setDiscountPrice(request.getDiscountPrice());

        Order updated = orderService.save(existingOrder);
        return ResponseEntity.ok(mapper.toOrderResponse(updated));
    }
    // tính doanh thu
    @GetMapping("/weekly-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyStats() {
        Map<String, Double> data = orderService.getWeeklyRevenueStats();
        List<Map<String, Object>> response = data.entrySet().stream().map(entry -> {
            Map<String, Object> map = new HashMap<>();
            map.put("day", entry.getKey());
            map.put("totalRevenue", entry.getValue());
            return map;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    // API lấy đơn hàng trong ngày hiện tại
    @GetMapping("/today-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponse>> getTodayOrders() {
        List<Order> orders = orderService.getOrdersToday();
        List<OrderResponse> responses = orders.stream()
                .map(mapper::toOrderResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    // API lấy doanh thu trong ngày hiện tại
    @GetMapping("/today-revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTodayRevenue() {
        double totalRevenue = orderService.getTodayRevenue();
        Map<String, Object> response = new HashMap<>();
        response.put("todayRevenue", totalRevenue);
        return ResponseEntity.ok(response);
    }

    /**
     * API lấy tổng số đơn hàng trong ngày hiện tại
     */
    @GetMapping("/total-orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTotalOrdersToday() {
        Long totalOrders = orderService.getTotalOrdersToday();
        Map<String, Object> response = new HashMap<>();
        response.put("totalOrdersToday", totalOrders);
        return ResponseEntity.ok(response);
    }

    /**
     * API lấy tổng số đơn hàng theo ngày cụ thể
     */
    @GetMapping("/total-orders/{date}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getTotalOrdersByDate(@PathVariable String date) {
        Long totalOrders = orderService.getTotalOrdersByDate(date);
        Map<String, Object> response = new HashMap<>();
        response.put("totalOrders", totalOrders);
        response.put("date", date);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/today")
    public ResponseEntity<List<OrderTodayResponse>> getOrdersByCurrentDate() {
        List<OrderTodayResponse> orders = orderService.getOrdersByCurrentDate();
        return ResponseEntity.ok(orders);
    }
}