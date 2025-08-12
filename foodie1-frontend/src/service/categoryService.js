import { axiosInstance } from "../configs/axios.config";

class CategoryService {
    static async getAllCategories() {
        return await axiosInstance.get('/categories');
    }

    static async getCategoryById(id) {
        return await axiosInstance.get(`/categories/${id}`);
    }

    static async createCategory(categoryData, token) {
        return await axiosInstance.post('/categories', categoryData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    static async updateCategory(id, categoryData, token) {
        return await axiosInstance.put(`/categories/${id}`, categoryData, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    static async deleteCategory(id, token) {
        return await axiosInstance.delete(`/categories/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    }

    // Lấy món ăn theo danh mục
    static async getFoodsByCategory(categoryId) {
        return await axiosInstance.get(`/food-items?categoryId=${categoryId}`);
    }
}

export default CategoryService; 