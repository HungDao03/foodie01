package com.foodie1.repo;

import com.foodie1.dto.response.OrderTodayResponse;
import com.foodie1.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    boolean existsByFoodItemId(Long foodItemId);
    @Query(value = "SELECT DAYOFWEEK(STR_TO_DATE(SUBSTRING_INDEX(REPLACE(order_time, 'T', ' '), '.', 1), '%Y-%m-%d %H:%i:%s')) AS dayOfWeek, " +
            "SUM(total_amount) " +
            "FROM orders " +
            "WHERE WEEK(STR_TO_DATE(SUBSTRING_INDEX(REPLACE(order_time, 'T', ' '), '.', 1), '%Y-%m-%d %H:%i:%s'), 1) = WEEK(CURRENT_DATE, 1) " +
            "AND STR_TO_DATE(SUBSTRING_INDEX(REPLACE(order_time, 'T', ' '), '.', 1), '%Y-%m-%d %H:%i:%s') IS NOT NULL " +
            "GROUP BY DAYOFWEEK(STR_TO_DATE(SUBSTRING_INDEX(REPLACE(order_time, 'T', ' '), '.', 1), '%Y-%m-%d %H:%i:%s')) " +
            "ORDER BY DAYOFWEEK(STR_TO_DATE(SUBSTRING_INDEX(REPLACE(order_time, 'T', ' '), '.', 1), '%Y-%m-%d %H:%i:%s'))",
            nativeQuery = true)
    List<Object[]> getRevenueGroupedByDayOfWeek();
    @Query("SELECT o FROM Order o WHERE SUBSTRING(o.orderTime, 1, 10) = :today")
    List<Order> findOrdersToday(@Param("today") String today);

    @Query("SELECT COUNT(o) FROM Order o WHERE SUBSTRING(o.orderTime, 1, 10) = :date")
    Long countOrdersByDate(@Param("date") String date);

    @Query("SELECT o FROM Order o WHERE SUBSTRING(o.orderTime, 1, 10) = :today")
    List<Order> findOrdersByCurrentDate(@Param("today") String today);
}