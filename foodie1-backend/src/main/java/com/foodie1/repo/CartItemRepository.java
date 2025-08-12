package com.foodie1.repo;

import com.foodie1.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByCartId(Long cartId);
    boolean existsByFoodItem_Category_Id(Long categoryId);

    Optional<CartItem> findByCartIdAndFoodItemId(Long cartId, Long foodItemId);
    void deleteByCartId(Long cartId);
    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.foodItem.id = :foodItemId")
    void deleteByCartIdAndFoodItemId(@Param("cartId") Long cartId, @Param("foodItemId") Long foodItemId);
} 