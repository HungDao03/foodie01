package com.foodie1.service.order;
import com.foodie1.dto.response.OrderItemResponse;

import com.foodie1.dto.response.OrderTodayResponse;
import com.foodie1.model.*;
import com.foodie1.repo.CartItemRepository;
import com.foodie1.repo.OrderRepository;
import com.foodie1.service.IGenericService;
import com.foodie1.dto.request.OrderRequestDTO;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Transactional
public class OrderService implements IGenericService<Order> {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Override
    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    @Override
    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    @Override
    public Order save(Order order) {
        return orderRepository.save(order);
    }

    @Override
    public void delete(Order order) {
        orderRepository.delete(order);
    }

    /**
     * Đặt hàng một món (API cũ)
     */
    public Order placeOrder(Order order) {
        order.setOrderTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").format(new Date()));
        order.setStatus(OrderStatus.CONFIRMED);
        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order updateOrderStatus(Long id, String statusStr) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return null;
        try {
            order.setStatus(OrderStatus.fromString(statusStr));
            return orderRepository.save(order);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Tạo đơn hàng từ các mục trong giỏ hàng
     */
    public Order createOrderFromCartItems(User user, OrderRequestDTO request) {
        List<CartItem> cartItems = cartItemRepository.findAllById(request.getCartItemIds());

        Order order = new Order();
        order.setUser(user);
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPhoneNumber(request.getPhoneNumber());
        order.setPaymentMethod(PaymentMethod.valueOf("COD"));
        order.setNotes(request.getNotes());
        order.setStatus(OrderStatus.CONFIRMED);
        order.setPaymentStatus(PaymentStatus.valueOf("NOT_PAID"));
        order.setOrderTime(LocalDateTime.now().toString());

        List<OrderItem> items = new ArrayList<>();
        double total = 0;

        for (CartItem cartItem : cartItems) {
            FoodItem food = cartItem.getFoodItem();
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setFoodItem(food); // Đảm bảo foodItem luôn được set
            orderItem.setFoodName(food.getName());

            double discount = food.getDiscountPrice();
            double finalPrice = discount > 0 ? discount : food.getPrice();

            orderItem.setPrice(finalPrice);
            orderItem.setDiscountPrice(discount);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setImageUrl(food.getImageUrl());

            total += finalPrice * cartItem.getQuantity();
            items.add(orderItem);
        }
        order.setItems(items);
        order.setTotalAmount(total);

        orderRepository.save(order);
        cartItemRepository.deleteAll(cartItems);
        return order;
    }

    public Order updatePaymentStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return null;

        PaymentStatus paymentStatus = PaymentStatus.valueOf(status);
        order.setPaymentStatus(paymentStatus);
        return orderRepository.save(order);
    }

    public Map<String, Double> getWeeklyRevenueStats() {
        List<Object[]> results = orderRepository.getRevenueGroupedByDayOfWeek();

        Map<Integer, String> weekDayMap = Map.of(
                1, "Chủ nhật",
                2, "Thứ 2",
                3, "Thứ 3",
                4, "Thứ 4",
                5, "Thứ 5",
                6, "Thứ 6",
                7, "Thứ 7"
        );

        // Khởi tạo dữ liệu với thứ tự từ Thứ 2 đến Chủ nhật
        String[] orderedDays = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
        Map<String, Double> revenueByDay = new LinkedHashMap<>();
        for (String day : orderedDays) {
            revenueByDay.put(day, 0.0);
        }

        // Cập nhật doanh thu từ kết quả truy vấn
        for (Object[] row : results) {
            int day = ((Number) row[0]).intValue(); // 1 = Chủ nhật, 2 = Thứ 2, ..., 7 = Thứ 7
            double total = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            String label = weekDayMap.get(day);
            if (label != null && revenueByDay.containsKey(label)) {
                revenueByDay.put(label, total);
            }
        }

        return revenueByDay;
    }

    public List<Order> getOrdersToday() {
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        return orderRepository.findOrdersToday(today);
    }

    public double getTodayRevenue() {
        String today = new SimpleDateFormat("yyyy-MM-dd").format(new Date());
        List<Order> orders = orderRepository.findOrdersToday(today);

        return orders.stream()
                .mapToDouble(Order::getTotalAmount)
                .sum();
    }

    /**
     * Lấy tổng số đơn hàng trong một ngày
     */
    public Long getTotalOrdersByDate(String date) {
        return orderRepository.countOrdersByDate(date);
    }

    /**
     * Lấy tổng số đơn hàng trong ngày hiện tại
     */
    public Long getTotalOrdersToday() {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        return orderRepository.countOrdersByDate(today);
    }

    // Lấy danh sách đơn hàng trong ngày hiện tại
    public List<OrderTodayResponse> getOrdersByCurrentDate() {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        List<Order> orders = orderRepository.findOrdersByCurrentDate(today);
        List<OrderTodayResponse> responses = new ArrayList<>();
        for (Order order : orders) {
            OrderTodayResponse resp = new OrderTodayResponse();
            resp.setId(order.getId());
            resp.setOrderTime(order.getOrderTime());
            resp.setDeliveryAddress(order.getDeliveryAddress());
            resp.setPhoneNumber(order.getPhoneNumber());
            resp.setTotalAmount(order.getTotalAmount());
            resp.setPaymentStatus(order.getPaymentStatus());
            resp.setPaymentMethod(order.getPaymentMethod());
            resp.setUsername(order.getUser() != null ? order.getUser().getUsername() : null);
            resp.setAvatar(order.getUser() != null ? order.getUser().getAvatar() : null);
                resp.setStatus(order.getStatus());
            // Nếu là đơn ghép, map sang OrderItemResponse
            List<OrderItem> itemList = order.getOrderItems() != null ? order.getOrderItems() : order.getItems();
            if (itemList != null && !itemList.isEmpty()) {
                String foodNames = itemList.stream()
                        .map(item -> item.getFoodName() != null ? item.getFoodName() : (item.getFoodItem() != null ? item.getFoodItem().getName() : ""))
                        .filter(name -> name != null && !name.isEmpty())
                        .distinct()
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("");
                resp.setFoodItemName(foodNames);
                List<OrderItemResponse> itemResponses = itemList.stream().map(item -> {
                    OrderItemResponse ir = new OrderItemResponse();
                    ir.setFoodName(item.getFoodName() != null ? item.getFoodName() : (item.getFoodItem() != null ? item.getFoodItem().getName() : ""));
                    ir.setPrice(item.getPrice());
                    ir.setQuantity(item.getQuantity());
                    ir.setImageUrl(item.getImageUrl());
                    ir.setDiscountPrice(item.getDiscountPrice() != null ? item.getDiscountPrice() : 0);
                    return ir;
                }).toList();
                resp.setItems(itemResponses);
            } else {
                resp.setFoodItemName(order.getFoodItem() != null ? order.getFoodItem().getName() : null);
                resp.setItems(new ArrayList<>());
            }
            responses.add(resp);
        }
        return responses;
    }
}