import { axiosInstance } from "../configs/axios.config.js";

class CartService {
    // Lấy giỏ hàng của user
    static async getCart(userId) {
        return await axiosInstance.get(`/cart/${userId}`);
    }

    // Thêm item vào giỏ hàng
    static async addItemToCart(userId, foodItemId, quantity = 1) {
        return await axiosInstance.post(`/cart/${userId}/add`, {
            foodItemId,
            quantity
        });
    }

    // Cập nhật số lượng item trong giỏ hàng
    static async updateCartItemQuantity(userId, foodItemId, quantity) {
        return await axiosInstance.put(`/cart/${userId}/update/${foodItemId}?quantity=${quantity}`);
    }


    // Xóa toàn bộ giỏ hàng
    static async clearCart(userId) {
        return await axiosInstance.delete(`/cart/${userId}/clear`);
    }
    // ✅ Hàm mới để gọi backend API đặt hàng các món đã chọn
    static async placeSelectedOrder(orderRequestDTO) {
        return await axiosInstance.post(`/orders/checkout`, orderRequestDTO);
    }

    // Xóa nhiều items đã chọn
    static async removeSelectedItems(userId, cartItemIds) {
        return await axiosInstance.delete(`/cart/${userId}/remove-selected`, {
            data: cartItemIds
        });
    }

}

export default CartService; 