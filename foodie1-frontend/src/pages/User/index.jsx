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
    const { searchResults, searchKeyword, updateSearchResult } = useSearchStore();

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
                // Lấy danh sách tất cả món ăn
                const response = await FoodItemsService.getAllFoods();
                const foodsData = response.data;
                
                // Lấy danh sách món ăn yêu thích
                let favoriteFoods = [];
                try {
                    const favoriteResponse = await FoodItemsService.getFavoriteFoods();
                    favoriteFoods = favoriteResponse.data || [];
                } catch (error) {
                    console.warn('Không thể lấy danh sách yêu thích:', error);
                }
                
                // Cập nhật trạng thái yêu thích cho tất cả món ăn
                const foodsWithFavorites = foodsData.map(food => {
                    const isFavorite = favoriteFoods.some(favFood => {
                        // So sánh ID dưới dạng string để tránh vấn đề kiểu dữ liệu
                        return String(favFood.id) === String(food.id);
                    });
                    return {
                        ...food,
                        favorite: isFavorite ? 1 : 0
                    };
                });
                
                setFoods(foodsWithFavorites);
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

    // Thêm useEffect để refresh danh sách món ăn khi cần thiết
    useEffect(() => {
        // Refresh danh sách món ăn khi component mount
        const refreshFoods = async () => {
            if (foods.length > 0) {
                await fetchFoods();
            }
        };
        
        refreshFoods();
    }, []);

    const handleOrderClick = (food) => {
        if (!localStorage.getItem('token')) {
            toast.error('Vui lòng đăng nhập để đặt hàng!');
            return;
        }
        setSelectedFood(food);
        setOrderModalOpen(true);
    };

    // Xử lý yêu thích món ăn
    const handleFavoriteToggle = async (foodId) => {
        try {
            // Kiểm tra trạng thái yêu thích hiện tại
            const currentFood = foods.find(food => food.id === foodId);
            const isCurrentlyFavorite = currentFood?.favorite === 1;
            
            if (isCurrentlyFavorite) {
                // Nếu đã yêu thích rồi, gọi API để bỏ khỏi yêu thích
                const response = await FoodItemsService.removeFromFavorites(foodId);
                const updatedFood = response.data;
                
                // Cập nhật state local
                setFoods(prev => 
                    prev.map(food => 
                        food.id === foodId 
                            ? { ...food, favorite: 0 } // Đặt về 0 ngay lập tức
                            : food
                    )
                );

                // Cập nhật searchResults nếu đang tìm kiếm
                if (searchResults.length > 0) {
                    updateSearchResult(foodId, 0);
                }

                // Hiển thị thông báo thành công
                toast.success(`Đã bỏ món "${updatedFood.name}" khỏi yêu thích!`);
            } else {
                // Nếu chưa yêu thích, gọi API để thêm vào yêu thích
                const response = await FoodItemsService.addToFavorites(foodId);
                const updatedFood = response.data;
                
                // Cập nhật state local
                setFoods(prev => 
                    prev.map(food => 
                        food.id === foodId 
                            ? { ...food, favorite: 1 } // Đặt về 1 ngay lập tức
                            : food
                    )
                );

                // Cập nhật searchResults nếu đang tìm kiếm
                if (searchResults.length > 0) {
                    updateSearchResult(foodId, 1);
                }

                // Hiển thị thông báo thành công
                toast.success(`Đã thêm món "${updatedFood.name}" vào yêu thích!`);
            }
            
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Không thể cập nhật trạng thái yêu thích');
        }
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
                <FoodGrid 
                    foods={displayFoods} 
                    onOrderClick={handleOrderClick}
                    onFavoriteToggle={handleFavoriteToggle}
                />
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
