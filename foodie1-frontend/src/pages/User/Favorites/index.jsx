import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    CircularProgress,
    useTheme,
    IconButton,
    Tooltip,
    Fade,
    Card,
    CardContent,
    Grid,
    Chip,
    Grow
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import HeartBrokenIcon from '@mui/icons-material/HeartBroken';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { toast } from 'react-toastify';
import FoodCard from "../../../components/list/FoodCard";
import FoodItemsService from "../../../service/food-itemsService";

function Favorites() {
    const [favoriteFoods, setFavoriteFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const theme = useTheme();

    // Load danh sách yêu thích từ API
    const loadFavorites = async () => {
        try {
            setLoading(true);
            const response = await FoodItemsService.getFavoriteFoods();

            if (response.data && Array.isArray(response.data)) {
                setFavoriteFoods(response.data);
            } else {
                console.warn('⚠️ Response data không phải array:', response.data);
                setFavoriteFoods([]);
            }
        } catch (error) {
            toast.error('Không thể tải danh sách yêu thích');
            setFavoriteFoods([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFavorites();
    }, []);

    // Toggle trạng thái yêu thích
    const handleToggleFavorite = async (foodId) => {
        try {
            const response = await FoodItemsService.toggleFavorite(foodId);
            const updatedFood = response.data;

            // Cập nhật state local
            setFavoriteFoods(prev =>
                prev.map(food =>
                    food.id === foodId
                        ? { ...food, favorite: updatedFood.favorite }
                        : food
                )
            );

            // Hiển thị thông báo
            const isFavorite = updatedFood.favorite === 1;
            toast.success(isFavorite ? 'Đã thêm vào yêu thích' : 'Đã bỏ khỏi yêu thích');

            // Nếu bỏ yêu thích, xóa khỏi danh sách
            if (!isFavorite) {
                setFavoriteFoods(prev => prev.filter(food => food.id !== foodId));
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error('Không thể cập nhật trạng thái yêu thích');
        }
    };

    // Xóa khỏi danh sách yêu thích (gọi API removeFromFavorites)
    const handleRemoveFavorite = async (foodId) => {
        try {
            await FoodItemsService.removeFromFavorites(foodId);
            
            // Xóa khỏi danh sách local
            setFavoriteFoods(prev => prev.filter(food => food.id !== foodId));
            
            // Hiển thị thông báo thành công
            toast.success('Đã bỏ khỏi danh sách yêu thích');
        } catch (error) {
            console.error('Error removing from favorites:', error);
            toast.error('Không thể bỏ khỏi danh sách yêu thích');
        }
    };

    const handleOrderClick = (food) => {
        // Redirect to order page or open order modal
        toast.info(`Chuyển đến trang đặt món: ${food.name}`);
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
            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
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
                    ? 'rgba(244, 67, 54, 0.2)' 
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
                    ? 'rgba(244, 67, 54, 0.2)' 
                    : 'rgba(255,255,255,0.1)',
                animation: 'pulse 2s infinite 1s'
            }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <FavoriteBorderIcon sx={{ 
                    fontSize: 80, 
                    color: 'rgba(255,255,255,0.8)', 
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }} />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Chưa có món ăn yêu thích
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Hãy khám phá và thêm những món ăn ngon vào danh sách yêu thích của bạn
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
                        Đang tải món ăn yêu thích...
                    </Typography>
                </Box>
            </Box>
        </Card>
    );

    if (loading) {
        return (
            <Box sx={{ 
                background: theme.palette.mode === 'dark' 
                    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                minHeight: '100vh',
                py: 3
            }}>
                <Container maxWidth="xl">
                    <LoadingSkeleton />
                </Container>
            </Box>
        );
    }

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
                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
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
                    <CardContent sx={{ position: 'relative', zIndex: 1, textAlign: 'center', py: 4 }}>
                        <Box sx={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 3,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)'
                        }}>
                            <FavoriteIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 800,
                                mb: 2,
                                color: 'white',
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                                fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
                            }}
                        >
                            ❤️ Món ăn yêu thích
                        </Typography>

                        <Typography
                            variant="h6"
                            sx={{
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 300,
                                maxWidth: 600,
                                mx: 'auto'
                            }}
                        >
                            Những món ăn bạn đã thêm vào danh sách yêu thích
                        </Typography>
                    </CardContent>
                </Card>

                {/* Stats Cards */}
                {favoriteFoods.length > 0 && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                        <StatCard
                            icon={<FavoriteIcon />}
                            title="Tổng món yêu thích"
                            value={favoriteFoods.length}
                            color={theme.palette.error.main}
                        />
                        <StatCard
                            icon={<RestaurantIcon />}
                            title="Loại món ăn"
                            value={new Set(favoriteFoods.map(f => f.category?.name)).size || 0}
                            color="#4CAF50"
                        />
                        <StatCard
                            icon={<StarIcon />}
                            title="Đánh giá cao"
                            value={favoriteFoods.filter(f => f.rating >= 4).length || 0}
                            color="#FF9800"
                        />
                        <StatCard
                            icon={<TrendingUpIcon />}
                            title="Món nổi bật"
                            value={favoriteFoods.filter(f => f.featured).length || 0}
                            color="#9C27B0"
                        />
                    </Box>
                )}

                {/* Favorites Grid */}
                {favoriteFoods.length > 0 ? (
                    <Grow in={true} timeout={800}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    sm: "repeat(auto-fill, minmax(300px, 1fr))",
                                    md: "repeat(auto-fill, minmax(320px, 1fr))",
                                    lg: "repeat(auto-fill, minmax(340px, 1fr))"
                                },
                                gap: { xs: 3, sm: 4, md: 4, lg: 5 },
                                py: 2,
                                px: { xs: 2, sm: 3 }
                            }}
                        >
                            {favoriteFoods.map((food, index) => (
                                <Fade in={true} key={food.id} timeout={600 + index * 100}>
                                    <Box sx={{ position: 'relative' }}>
                                        {/* Remove from Favorites Button */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                right: 12,
                                                zIndex: 10,
                                            }}
                                        >
                                            <Tooltip title="Bỏ khỏi yêu thích" placement="top">
                                                <IconButton
                                                    onClick={() => handleRemoveFavorite(food.id)}
                                                    sx={{
                                                        bgcolor: 'rgba(255, 255, 255, 0.95)',
                                                        backdropFilter: 'blur(12px)',
                                                        width: 40,
                                                        height: 40,
                                                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(255, 255, 255, 1)',
                                                            transform: 'scale(1.1)',
                                                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                                                        },
                                                        transition: 'all 0.2s ease'
                                                    }}
                                                >
                                                    <HeartBrokenIcon sx={{
                                                        color: 'error.main',
                                                        fontSize: 20
                                                    }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>

                                        {/* FoodCard Component */}
                                        <FoodCard
                                            food={food}
                                            onOrderClick={handleOrderClick}
                                            onFavoriteToggle={handleToggleFavorite}
                                            isFavorite={true}
                                        />
                                    </Box>
                                </Fade>
                            ))}
                        </Box>
                    </Grow>
                ) : (
                    <EmptyState />
                )}
            </Container>
        </Box>
    );
}

export default Favorites;
