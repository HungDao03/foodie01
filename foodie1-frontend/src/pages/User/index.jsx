import {
    Typography,
    Box,
    Container,
    Button,
    CircularProgress
} from "@mui/material";
import { useState, useEffect } from "react";

import { toast } from "react-toastify";
import FoodGrid from "../../components/list/FoodGrid/index.jsx";
import OrderModal from "./Order/OrderModal/index.jsx";
import FoodItemsService from "../../service/food-itemsService.js";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../../components/store/searchStore.jsx";
import UserService from "../../service/userService.js";

function FoodCardList() {
    const [selectedFood, setSelectedFood] = useState(null);
    const [orderModalOpen, setOrderModalOpen] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { searchResults, searchKeyword } = useSearchStore();

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Bạn cần đăng nhập để tiếp tục");
                navigate("/unauthorized");
            }
        };

        const fetchFoods = async () => {
            setLoading(true);
            try {
                const response = await FoodItemsService.getAllFoods();
                setFoods(response.data);
            } catch {
                toast.error("Không thể tải danh sách món ăn");
                setFoods([]);
            } finally {
                setLoading(false);
            }
        };

        const fetchUserInfo = async () => {
            try {
                const res = await UserService.getUserProfile();
                const userData = res.data;

                // Nếu chưa xác minh, chuyển hướng ngay
                if (!userData.verified) {
                    toast.warning("Tài khoản chưa xác minh!");
                    navigate("/verify-account");
                    return;
                }

                setUserInfo(userData);
            } catch (error) {
                console.error("Lỗi lấy thông tin người dùng:", error);
                toast.error("Không thể lấy thông tin người dùng");
            }
        };

        checkAuth();
        fetchFoods();
        fetchUserInfo();

        // 🕒 Thêm đoạn này để kiểm tra lại verified mỗi 10s
        const interval = setInterval(fetchUserInfo, 10000);

        return () => clearInterval(interval); // cleanup khi unmount
    }, []);

    const handleOrderClick = (food) => {
        if (!localStorage.getItem('token')) {
            toast.error('Vui lòng đăng nhập để đặt hàng!');
            return;
        }
        setSelectedFood(food);
        setOrderModalOpen(true);
    };

    const displayFoods = searchKeyword ? searchResults : foods;

    return (
        <Container maxWidth="xl">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                    🔥 Ưu đãi hôm nay
                </Typography>
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontSize: '1.1rem' }}>
                    Khám phá những món ăn ngon với giá ưu đãi đặc biệt
                </Typography>

                {searchKeyword && (
                    <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
                        Kết quả tìm kiếm cho "{searchKeyword}"
                    </Typography>
                )}
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <FoodGrid foods={displayFoods} onOrderClick={handleOrderClick} />
            )}

            <OrderModal
                open={orderModalOpen}
                onClose={() => setOrderModalOpen(false)}
                foodItem={selectedFood}
                userInfo={userInfo}
            />
        </Container>
    );
}

export default FoodCardList;
