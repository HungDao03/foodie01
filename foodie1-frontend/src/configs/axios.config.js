import axios from "axios";

// Cấu hình axios với baseURL
export const axiosInstance = axios.create({
    // baseURL: "http://localhost:8080/api"
    baseURL: import.meta.env.VITE_API_BASE_URL,
    
});

// Thêm Authorization token vào header trước mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`; // ✅ Sửa đúng định dạng
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Xử lý response lỗi (ví dụ: token hết hạn)
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // ✅ Nếu hết hạn token thì xóa localStorage và điều hướng về login
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '';
        }
        return Promise.reject(error);
    }
);
