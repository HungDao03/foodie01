import {axiosInstance} from "../configs/axios.config.js";

class FoodItemsService {
    static async searchFoods(keyword) {
            return await axiosInstance.get(`/food-items/search?keyword=${keyword}`);
        }
    static async getAllFoods() {
        return await axiosInstance.get("/food-items");
    }
    static async addFood(foodData) {
        // Nếu foodData đã là FormData, sử dụng trực tiếp
        if (foodData instanceof FormData) {
            return await axiosInstance.post("/food-items", foodData); // ✅ KHÔNG thêm headers thủ công
        }

        // Nếu là object thường, chuyển thành FormData
        const formData = new FormData();
        Object.keys(foodData).forEach(key => {
            if (foodData[key] != null) {
                formData.append(key, foodData[key]);
            }
        });

        return await axiosInstance.post("/food-items", formData); // ✅ KHÔNG thêm headers thủ công
    }

    static async updateFood(id, foodData) {
        const formData = foodData instanceof FormData
            ? foodData
            : Object.entries(foodData).reduce((fd, [key, value]) => {
                if (value != null) fd.append(key, value);
                return fd;
            }, new FormData());

        return await axiosInstance.put(`/food-items/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }

    static async deleteFood(id) {
        return await axiosInstance.delete(`/food-items/${id}`);
    }

    // lấy tất cả món ăn theo id cua danh muc
    static async getFoodsByCategory(categoryId) {
        return await axiosInstance.get(`/food-items?categoryId=${categoryId}`);
    }

    // Thêm món ăn vào yêu thích (0 → 1)
    static async addToFavorites(foodId) {
        return await axiosInstance.post(`/food-items/${foodId}/add-to-favorites`);
    }

    // Bỏ món ăn khỏi yêu thích (1 → 0)
    static async removeFromFavorites(foodId) {
        return await axiosInstance.post(`/food-items/${foodId}/remove-from-favorites`);
    }

    // Lấy danh sách tất cả món ăn yêu thích
    static async getFavoriteFoods() {
        return await axiosInstance.get("/food-items/favorites");
    }

    // Toggle trạng thái yêu thích (0 → 1 hoặc 1 → 0)
    static async toggleFavorite(foodId) {
        return await axiosInstance.post(`/food-items/${foodId}/toggle-favorite`);
    }
}

export default FoodItemsService;