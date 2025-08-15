import {
    Box, Button, Typography, useTheme,
    Snackbar, Alert, Stack, Chip, IconButton,
    Skeleton, Fade, Grow
} from "@mui/material";
import { useState, useRef, useCallback } from 'react';
import AddToCartButton from './AddToCartButton.jsx';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StoreIcon from '@mui/icons-material/Store';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

export default function FoodCard({ food, onOrderClick, onFavoriteToggle, isFavorite = false, hideActionButtons = false, isAdmin = false, onDelete = null }) {
    const theme = useTheme();

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const cardRef = useRef(null);

    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    const handleImageError = useCallback((e) => {
        setImageError(true);
        setImageLoaded(true);
        e.target.src = "https://placehold.co/300x200/e0e0e0/757575?text=Không+có+ảnh";
    }, []);

    const getFoodImageUrl = useCallback((imageUrl) => {
        if (!imageUrl) return "https://placehold.co/300x200/e0e0e0/757575?text=Không+có+ảnh";
        if (imageUrl.startsWith("http")) return imageUrl;
        return `${import.meta.env.VITE_API_BASE_URL_GG}uploads/food/${imageUrl}`;
    }, []);

    const handleFavoriteClick = useCallback((e) => {
        e.stopPropagation();
        if (isAdmin && onDelete) {
            // Trong admin mode, nút trái tim sẽ là nút xóa
            onDelete(food.id);
        } else {
            // Trong user mode, nút trái tim sẽ là nút yêu thích
            onFavoriteToggle?.(food.id);
            
            // Cập nhật state local ngay lập tức để hiển thị trái tim đỏ
            // Không cần setSnackbar vì đã có toast từ component cha
        }
    }, [food.id, isFavorite, onFavoriteToggle, isAdmin, onDelete]);

    const handleAddToCart = useCallback(() => {
        setSnackbar({
            open: true,
            message: 'Đã thêm vào giỏ hàng!',
            severity: 'success'
        });
    }, []);

    const handleOrderClick = useCallback((e) => {
        e.stopPropagation();
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        onOrderClick(food);
    }, [food, onOrderClick]);

    const closeSnackbar = useCallback(() => {
        setSnackbar(prev => ({ ...prev, open: false }));
    }, []);

    const discountPercent = food.discountPrice
        ? Math.round((1 - food.discountPrice / food.price) * 100)
        : 0;

    return (
        <Grow in timeout={400}>
            <Box
                ref={cardRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={isAdmin ? () => onOrderClick(food) : undefined}
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    boxShadow: isHovered ? 16 : 3,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-16px) scale(1.05)' : 'translateY(0) scale(1)',
                    position: 'relative',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
                    cursor: isAdmin ? 'pointer' : 'default',
                    '&:hover': {
                        borderColor: theme.palette.primary.main,
                        '& .food-image': {
                            transform: 'scale(1.1)',
                        }
                    },
                    ...(isPressed && {
                        transform: 'translateY(-8px) scale(0.98)',
                    })
                }}
            >
                {/* Enhanced Image Container */}
                <Box sx={{
                    height: 180,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'
                }}>
                    {!imageLoaded && !imageError && (
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            animation="wave"
                            sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }}
                        />
                    )}

                    <Fade in={imageLoaded} timeout={600}>
                        <img
                            className="food-image"
                            src={getFoodImageUrl(food.imageUrl)}
                            alt={food.name}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                                transform: 'scale(1)',
                                display: imageLoaded ? 'block' : 'none'
                            }}
                        />
                    </Fade>

                    {/* Enhanced Discount Badge */}
                    {discountPercent > 0 && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                color: 'white',
                                borderRadius: 3,
                                px: 1.5,
                                py: 0.5,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                boxShadow: '0 4px 12px rgba(244,67,54,0.4)',
                                animation: 'pulse 2s infinite'
                            }}
                        >
                            <LocalOfferIcon sx={{ fontSize: 16 }} />
                            <Typography sx={{ 
                                fontWeight: 800, 
                                fontSize: '0.75rem',
                                lineHeight: 1
                            }}>
                                -{discountPercent}%
                            </Typography>
                        </Box>
                    )}

                    {/* Enhanced Favorite Button / Delete Button */}
                    <IconButton
                        onClick={handleFavoriteClick}
                        sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            width: 40,
                            height: 40,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)',
                                transform: 'scale(1.2) rotate(8deg)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                            }
                        }}
                    >
                        {isAdmin ? (
                            // Admin mode: Hiển thị nút X để xóa
                            <Box
                                component="span"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    height: '100%',
                                    color: theme.palette.error.main,
                                    fontSize: 20,
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        color: theme.palette.error.dark,
                                    }
                                }}
                            >
                                ✕
                            </Box>
                        ) : (
                            // User mode: Hiển thị nút trái tim
                            isFavorite ?
                                <FavoriteIcon sx={{ 
                                    color: 'error.main', 
                                    fontSize: 20,
                                    filter: 'drop-shadow(0 2px 4px rgba(244,67,54,0.3))'
                                }} /> :
                                <FavoriteBorderIcon sx={{ 
                                    fontSize: 20,
                                    color: theme.palette.text.secondary
                                }} />
                        )}
                    </IconButton>

                    {/* Enhanced Gradient Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '60%',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.2))',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.4s ease'
                        }}
                    />
                </Box>

                {/* Enhanced Content */}
                <Box sx={{ 
                    p: 2.5, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flexGrow: 1,
                    gap: 1.5
                }}>
                    {/* Enhanced Food Name */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.6em',
                            fontSize: '1rem',
                            color: theme.palette.text.primary,
                            textShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.15)' : 'none',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        {food.name}
                    </Typography>

                    {/* Enhanced Price Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: 0.5
                    }}>
                        {food.discountPrice ? (
                            <Stack spacing={0.5}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        textDecoration: "line-through",
                                        fontWeight: 500,
                                        fontSize: '0.85rem',
                                        opacity: 0.7
                                    }}
                                >
                                    {food.price.toLocaleString()}đ
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontSize: "1.2rem",
                                        textShadow: '0 2px 4px rgba(244,67,54,0.2)'
                                    }}
                                >
                                    {food.discountPrice.toLocaleString()}đ
                                </Typography>
                            </Stack>
                        ) : (
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 700,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    fontSize: "1.2rem",
                                    textShadow: '0 2px 4px rgba(25,118,210,0.2)'
                                    }}
                            >
                                {food.price.toLocaleString()}đ
                            </Typography>
                        )}
                    </Box>

                    {/* Enhanced Info Chips */}
                    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                        <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                            label={`${food.deliveryTime}-${food.deliveryTime + 10}p`}
                            variant="outlined"
                            size="small"
                            sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                fontWeight: 600,
                                borderWidth: 1.5,
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.main,
                                '& .MuiChip-icon': { fontSize: 16 },
                                '&:hover': {
                                    bgcolor: `${theme.palette.primary.main}10`,
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease'
                            }}
                        />
                        <Chip
                            icon={<StoreIcon sx={{ fontSize: 16 }} />}
                            label={food.restaurant}
                            variant="outlined"
                            size="small"
                            sx={{
                                fontSize: '0.75rem',
                                height: 28,
                                fontWeight: 600,
                                borderWidth: 1.5,
                                borderColor: theme.palette.secondary.main,
                                color: theme.palette.secondary.main,
                                maxWidth: 120,
                                '& .MuiChip-icon': { fontSize: 16 },
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                },
                                '&:hover': {
                                    bgcolor: `${theme.palette.secondary.main}10`,
                                    transform: 'translateY(-1px)',
                                },
                                transition: 'all 0.2s ease'
                            }}
                        />
                    </Stack>

                    {/* Enhanced Action Buttons */}
                    {!hideActionButtons && (
                        <Stack direction="row" spacing={1.5} sx={{ mt: "auto", pt: 1 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="medium"
                                onClick={handleOrderClick}
                                startIcon={<FastfoodIcon />}
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    fontSize: "0.85rem",
                                    py: 1,
                                    minHeight: 40,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    boxShadow: isHovered ? '0 12px 32px rgba(25,118,210,0.5)' : '0 4px 16px rgba(25,118,210,0.3)',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 16px 40px rgba(25,118,210,0.6)',
                                    }
                                }}
                            >
                                Đặt ngay
                            </Button>

                            <AddToCartButton
                                foodItem={food}
                                quantity={1}
                                fullWidth
                                variant="outlined"
                                size="medium"
                                onClick={handleAddToCart}
                                sx={{
                                    fontWeight: 700,
                                    borderRadius: 2.5,
                                    textTransform: "none",
                                    fontSize: "0.85rem",
                                    py: 1,
                                    minHeight: 40,
                                    borderWidth: 2,
                                    borderColor: theme.palette.secondary.main,
                                    color: theme.palette.secondary.main,
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        borderWidth: 2,
                                        borderColor: theme.palette.secondary.dark,
                                        bgcolor: `${theme.palette.secondary.main}10`,
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 12px 32px rgba(156,39,176,0.4)',
                                    }
                                }}
                            />
                        </Stack>
                    )}
                </Box>

                {/* Enhanced Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={closeSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    TransitionComponent={Grow}
                >
                    <Alert
                        severity={snackbar.severity}
                        onClose={closeSnackbar}
                        sx={{
                            width: '100%',
                            borderRadius: 3,
                            fontWeight: 600,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Grow>
    );
}