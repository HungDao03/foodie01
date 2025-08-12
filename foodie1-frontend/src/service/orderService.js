import { axiosInstance } from "../configs/axios.config";

class OrderService {

    // Tạo đơn hàng mới (API cũ - đặt hàng đơn lẻ)
    static async createOrder(orderData) {
        return await axiosInstance.post("/orders", orderData);
    }


    // Lấy tất cả đơn hàng (cho admin)
    static async getAllOrders() {
        return await axiosInstance.get("/orders");
    }

    // Lấy đơn hàng của user hiện tại
    static async getUserOrders() {
        const user = JSON.parse(localStorage.getItem('user'));
        return await axiosInstance.get(`/orders/${user.id}`);
    }

    // Đặt hàng từ giỏ hàng (API mới)
    static async placeOrderFromCart(orderData) {
        return await axiosInstance.post("/orders/place-order-from-cart", orderData);
    }

    // Lấy chi tiết đơn hàng với OrderItems
    static async getOrderDetails(orderId) {
        return await axiosInstance.get(`/orders/${orderId}/details`);
    }


    //  Cập nhật trạng thái đơn hàng (cho admin)
    static async updateOrderStatus(orderId, status) {
        return await axiosInstance.patch(`/orders/${orderId}/status`, {
            status: status
        });
    }

    // Xóa đơn hàng (cho admin)
    static async deleteOrder(orderId) {
        return await axiosInstance.delete(`/orders/${orderId}`);
    }

    // Lấy thống kê doanh thu theo từng ngày trong tuần (cho dashboard admin)
    static async getWeeklyRevenueStats() {
        return await axiosInstance.get("/orders/weekly-stats");
    }

    // Lấy tổng doanh thu hôm nay (cho admin)
    static async getTodayRevenue() {
        return await axiosInstance.get("/orders/today-revenue");
    }

    // Lấy tổng số đơn hàng trong ngaày (cho admin)
    static async getTotalOrders() {
        return await axiosInstance.get("/orders/total-orders");
    }

    // Lấy danh sách đơn hàng hôm nay (API mới cho admin)
    static async getOrdersToday() {
        return await axiosInstance.get("/orders/today");
    }
}

export default OrderService;
