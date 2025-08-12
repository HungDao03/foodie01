import { axiosInstance } from "../configs/axios.config";

class UserService {
    // Quản lý người dùng
    static async getAllUsers() {
        return await axiosInstance.get("/users/all");
    }

    static async deleteUser(userId) {
        return await axiosInstance.delete(`/users/${userId}`);
    }

    static async toggleVerified(userId) {
        return await axiosInstance.put(`/users/toggle-verified/${userId}`);
    }

    static async sendNotification(userId) {
        return await axiosInstance.post(`/users/send-notification/${userId}`, {
            type: 'email',
            message: 'Thông báo từ hệ thống'
        });
    }

    // Quản lý thông tin cá nhân
    static async getUserProfile() {
        return await axiosInstance.get("/users/profile");
    }

    static async updateUserProfile(profileData) {
        return await axiosInstance.put("/users/profile", profileData);
    }

    static async changePassword(passwordData) {
        return await axiosInstance.put("/users/password", passwordData);
    }

    // Upload avatar mới
    static async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await axiosInstance.post("/users/avatar", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

export default UserService;
