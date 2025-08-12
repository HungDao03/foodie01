
class AuthService {
    // Phương thức đăng xuất
    static logout() {
        // Xóa token và thông tin người dùng khỏi localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }


    // Lấy thông tin người dùng hiện tại từ localStorage
    static getCurrentUser() {
        const userStr = localStorage.getItem('user'); // Lấy chuỗi JSON người dùng
        return userStr ? JSON.parse(userStr) : null;   // Chuyển về object nếu tồn tại
    }

    // Kiểm tra xem người dùng hiện tại có phải admin hay không
    static isAdmin() {
        const user = this.getCurrentUser();        // Lấy user hiện tại
        return user?.role === 'ADMIN';             // Trả về true nếu role là 'ADMIN'
    }
}


export default AuthService;
