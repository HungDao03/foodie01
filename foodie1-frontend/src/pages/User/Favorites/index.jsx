import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    CircularProgress,
    useTheme,
    IconButton,
    Tooltip,
    Fade
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress color="primary" />
            </Box>
        );
    }

    return (
        <Box sx={{ py: 4, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{
                    textAlign: 'center',
                    mb: 6,
                    px: 2
                }}>
                    <Box sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: '0 8px 24px rgba(244,67,54,0.3)'
                    }}>
                        <FavoriteIcon sx={{ color: 'white', fontSize: '2.5rem' }} />
                    </Box>

                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 800,
                            mb: 2,
                            background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            fontSize: { xs: '2rem', md: '2.5rem', lg: '3rem' }
                        }}
                    >
                        Món ăn yêu thích
                    </Typography>

                    <Typography
                        variant="h6"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 400,
                            maxWidth: 600,
                            mx: 'auto',
                            opacity: 0.8
                        }}
                    >
                        Những món ăn bạn đã thêm vào danh sách yêu thích
                    </Typography>
                </Box>

                {/* Favorites Grid */}
                {favoriteFoods.length > 0 ? (
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
                        {favoriteFoods.map((food) => (
                            <Box key={food.id} sx={{ position: 'relative' }}>
                                {/* Remove from Favorites Button */}
                                <Fade in={true} timeout={600}>
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
                                                <FavoriteIcon sx={{
                                                    color: 'error.main',
                                                    fontSize: 20
                                                }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Fade>

                                {/* FoodCard Component */}
                                <FoodCard
                                    food={food}
                                    onOrderClick={handleOrderClick}
                                    onFavoriteToggle={handleToggleFavorite}
                                    isFavorite={true}
                                />
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Box sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 3
                    }}>
                        <Box sx={{
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.palette.error.main}20 0%, ${theme.palette.error.dark}20 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2
                        }}>
                            <FavoriteBorderIcon sx={{
                                fontSize: '3rem',
                                color: theme.palette.error.main,
                                opacity: 0.6
                            }} />
                        </Box>

                        <Typography variant="h5" sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 1
                        }}>
                            Chưa có món ăn yêu thích
                        </Typography>

                        <Typography variant="body1" sx={{
                            color: 'text.secondary',
                            maxWidth: 400,
                            mb: 3,
                            opacity: 0.8
                        }}>
                            Hãy khám phá và thêm những món ăn ngon vào danh sách yêu thích của bạn
                        </Typography>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

export default Favorites;
