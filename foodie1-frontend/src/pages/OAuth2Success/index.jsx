import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OAuth2Success = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!location.search) {
            navigate("/", { state: { error: "Không tìm thấy thông tin đăng nhập." } });
            return;
        }

        const params = new URLSearchParams(location.search);
        const userParam = params.get("user");
        const message = params.get("message");

        // ✅ Hiển thị thông báo xác minh (nếu có)
        if (message) {
            toast.success(message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                onClose: () => {
                    navigate("/", { replace: true });
                },
            });
            return;
        }

        // ✅ Nếu có userParam (từ backend redirect)
        if (userParam) {
            try {
                const decoded = decodeURIComponent(userParam);
                const user = JSON.parse(decoded);

                if (user && user.token && user.username) {
                    localStorage.setItem("user", JSON.stringify(user));
                    localStorage.setItem("token", user.token);
                    toast.success("Đăng nhập thành công");
                    
                    // Kiểm tra role để redirect đúng
                    const isAdmin = user.authorities && user.authorities.some(
                        auth => auth.authority === 'ROLE_ADMIN'
                    );
                    
                    if (isAdmin) {
                        navigate("/admin");
                    } else {
                        navigate("/user");
                    }
                } else {
                    navigate("/", { state: { error: "Dữ liệu người dùng không hợp lệ." } });
                }
            } catch (err) {
                navigate("/", { state: { error: "Lỗi xử lý thông tin đăng nhập." } });
            }
        } else {
            // ❌ Không fetch thủ công backend nữa – tránh CORS
            navigate("/", { state: { error: "Không tìm thấy dữ liệu đăng nhập từ Google." } });
        }
    }, [location, navigate]);

    return <div>Đang đăng nhập bằng Google...</div>;
};

export default OAuth2Success;
