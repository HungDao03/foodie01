import { axiosInstance } from "../configs/axios.config";

class AdminService {

    // Quản lý đơn hàng
    static async getAllOrders() {
        return await axiosInstance.get("/orders");
    }

    static async updateOrderStatus(orderId, status) {
        return await axiosInstance.patch(`/orders/${orderId}/payment-status`, { status });
    }

    static async deleteOrder(orderId) {
        return await axiosInstance.delete(`/orders/${orderId}`);
    }
}

export default AdminService;
