import {
    Typography,
    Box,
    Container,
    Button,
    CircularProgress,
    Card,
    CardContent,
    useTheme,
    alpha,
    Grid,
    Chip,
    Avatar,
    IconButton,
    Tooltip,
    Fade,
    Grow
} from "@mui/material";
import {
    LocalFireDepartment as FireIcon,
    Search as SearchIcon,
    Favorite as FavoriteIcon,
    ShoppingCart as CartIcon,
    TrendingUp as TrendingUpIcon,
    Star as StarIcon,
    Restaurant as RestaurantIcon
} from "@mui/icons-material";
import { useState, useEffect } from "react";

import { toast } from "react-toastify";
import FoodGrid from "../../components/list/FoodGrid/index.jsx";
import OrderModal from "./Order/OrderModal/index.jsx";
import FoodItemsService from "../../service/food-itemsService.js";
import { useNavigate } from "react-router-dom";
import useSearchStore from "../../components/store/searchStore.jsx";
import UserService from "../../service/userService.js";

function FoodCardList() {
    const theme = useTheme();
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

    const StatCard = ({ icon, title, value, color, gradient, subtitle }) => (
        <Card elevation={0} sx={{
            background: gradient || `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            borderRadius: 3,
            border: `1px solid ${color}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${color}40`,
                border: `1px solid ${color}50`
            }
        }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color={color}>
                            {value}
                        </Typography>
                        {subtitle && (
                            <Typography variant="caption" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    const EmptyState = () => (
        <Card elevation={0} sx={{ 
            textAlign: 'center', 
            py: 8,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
        }}>
            <Box sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: theme.palette.mode === 'dark' 
                    ? 'rgba(118, 75, 162, 0.2)' 
                    : 'rgba(255,255,255,0.1)',
                animation: 'pulse 2s infinite'
            }} />
            <Box sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: theme.palette.mode === 'dark' 
                    ? 'rgba(118, 75, 162, 0.2)' 
                    : 'rgba(255,255,255,0.1)',
                animation: 'pulse 2s infinite 1s'
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <RestaurantIcon sx={{ 
                    fontSize: 80, 
                    color: 'rgba(255,255,255,0.8)', 
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }} />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Chưa có món ăn nào
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Các món ăn sẽ hiển thị ở đây khi có sẵn
                </Typography>
            </CardContent>
        </Card>
    );

    const LoadingSkeleton = () => (
        <Card elevation={0} sx={{ 
            background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.05)' 
                : 'rgba(0,0,0,0.02)',
            borderRadius: 3
        }}>
            <Box sx={{ p: 3, background: 'rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <CircularProgress size={40} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        Đang tải món ăn...
                    </Typography>
                </Box>
            </Box>
        </Card>
    );

    const displayFoods = searchKeyword ? searchResults : foods;

    return (
        <Box sx={{ 
            background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            py: 3
        }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Card elevation={0} sx={{ 
                    mb: 3, 
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: '100%',
                        height: '100%',
                        background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        opacity: 0.3
                    }} />
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box>
                                <Typography variant="h3" fontWeight="bold" sx={{ 
                                    color: 'white', 
                                    mb: 1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                }}>
                                    🔥 Ưu đãi hôm nay
                                </Typography>
                                <Typography variant="h6" sx={{ 
                                    color: 'rgba(255,255,255,0.9)',
                                    fontWeight: 300
                                }}>
                                    Khám phá những món ăn ngon với giá ưu đãi đặc biệt
                                </Typography>
                            </Box>
                            <Box display="flex" gap={2} alignItems="center">
                                <Box sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    background: theme.palette.mode === 'dark' 
                                        ? 'rgba(118, 75, 162, 0.1)' 
                                        : 'rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(10px)',
                                    border: theme.palette.mode === 'dark' 
                                        ? '1px solid rgba(118, 75, 162, 0.2)' 
                                        : '1px solid rgba(255,255,255,0.2)'
                                }}>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <FireIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            Món ăn nổi bật
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Search Results Header */}
                {searchKeyword && (
                    <Fade in={true} timeout={500}>
                        <Card elevation={0} sx={{ 
                            mb: 3, 
                            background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                            borderRadius: 3,
                            overflow: 'hidden'
                        }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box display="flex" alignItems="center" gap={2}>
                                    <SearchIcon sx={{ color: 'white', fontSize: 28 }} />
                                    <Box>
                                        <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                                            Kết quả tìm kiếm
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                            Tìm thấy {searchResults.length} món ăn cho "{searchKeyword}"
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Fade>
                )}

                {/* Stats Cards */}
                {foods.length > 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                        <StatCard
                            icon={<RestaurantIcon />}
                            title="Tổng món ăn"
                            value={foods.length}
                            color={theme.palette.primary.main}
                        />
                        <StatCard
                            icon={<FavoriteIcon />}
                            title="Món yêu thích"
                            value={foods.filter(f => f.favorite === 1).length}
                            color="#E91E63"
                        />
                        <StatCard
                            icon={<TrendingUpIcon />}
                            title="Món nổi bật"
                            value={foods.filter(f => f.featured).length || 0}
                            color="#FF9800"
                        />
                        <StatCard
                            icon={<StarIcon />}
                            title="Đánh giá cao"
                            value={foods.filter(f => f.rating >= 4).length || 0}
                            color="#4CAF50"
                        />
                    </Box>
                )}

                {/* Content Section */}
                {loading ? (
                    <LoadingSkeleton />
                ) : displayFoods.length === 0 ? (
                    <EmptyState />
                ) : (
                    <Grow in={true} timeout={800}>
                        <Box>
                            <FoodGrid 
                                foods={displayFoods} 
                                onOrderClick={handleOrderClick}
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        </Box>
                    </Grow>
                )}

                <OrderModal
                    open={orderModalOpen}
                    onClose={() => setOrderModalOpen(false)}
                    foodItem={selectedFood}
                    userInfo={userInfo}
                />
            </Container>
        </Box>
    );
}

export default FoodCardList;
