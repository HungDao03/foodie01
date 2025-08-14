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

export default function FoodCard({ food, onOrderClick, onFavoriteToggle, isFavorite = false }) {
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
        onFavoriteToggle?.(food.id);
        setSnackbar({
            open: true,
            message: isFavorite ? 'Đã bỏ yêu thích' : 'Đã thêm vào yêu thích',
            severity: 'info'
        });
    }, [food.id, isFavorite, onFavoriteToggle]);

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
        <Grow in timeout={300}>
            <Box
                ref={cardRef}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    boxShadow: isHovered ? 8 : 2,
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    cursor: 'pointer',
                    position: 'relative',
                    border: `1px solid ${theme.palette.divider}`,
                    '&:hover': {
                        borderColor: theme.palette.primary.main,
                    },
                    ...(isPressed && {
                        transform: 'translateY(-4px) scale(0.98)',
                    })
                }}
            >
                {/* Image Container with Enhanced Features */}
                <Box sx={{
                    height: 200,
                    overflow: 'hidden',
                    position: 'relative',
                    bgcolor: theme.palette.grey[100]
                }}>
                    {!imageLoaded && !imageError && (
                        <Skeleton
                            variant="rectangular"
                            width="100%"
                            height="100%"
                            animation="wave"
                        />
                    )}

                    <Fade in={imageLoaded} timeout={500}>
                        <img
                            src={getFoodImageUrl(food.imageUrl)}
                            alt={food.name}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.3s ease',
                                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                                display: imageLoaded ? 'block' : 'none'
                            }}
                        />
                    </Fade>

                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                        <Chip
                            icon={<LocalOfferIcon sx={{ fontSize: 14 }} />}
                            label={`-${discountPercent}%`}
                            color="error"
                            size="small"
                            sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                height: 24,
                                '& .MuiChip-icon': { fontSize: 14 }
                            }}
                        />
                    )}

                    {/* Favorite Button */}
                    <IconButton
                        onClick={handleFavoriteClick}
                        sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(8px)',
                            width: 36,
                            height: 36,
                            transition: 'all 0.2s',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 1)',
                                transform: 'scale(1.1)',
                            }
                        }}
                    >
                        {isFavorite ?
                            <FavoriteIcon sx={{ color: 'error.main', fontSize: 18 }} /> :
                            <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                        }
                    </IconButton>

                    {/* Gradient Overlay */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '40%',
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.1))',
                            opacity: isHovered ? 1 : 0,
                            transition: 'opacity 0.3s ease'
                        }}
                    />
                </Box>

                {/* Content */}
                <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {/* Food Name */}
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            mb: 1.5,
                            lineHeight: 1.3,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: '2.6em'
                        }}
                    >
                        {food.name}
                    </Typography>

                    {/* Price Section */}
                    <Box sx={{ mb: 2 }}>
                        {food.discountPrice ? (
                            <Stack spacing={0.5}>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        textDecoration: "line-through",
                                        fontWeight: 500
                                    }}
                                >
                                    {food.price.toLocaleString()}đ
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        color: 'error.main',
                                        fontSize: "1.3rem"
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
                                    color: theme.palette.primary.main,
                                    fontSize: "1.3rem"
                                }}
                            >
                                {food.price.toLocaleString()}đ
                            </Typography>
                        )}
                    </Box>

                    {/* Info Chips */}
                    <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Chip
                            icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                            label={`${food.deliveryTime}-${food.deliveryTime + 10}p`}
                            variant="outlined"
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                height: 28,
                                '& .MuiChip-icon': { fontSize: 14 }
                            }}
                        />
                        <Chip
                            icon={<StoreIcon sx={{ fontSize: 16 }} />}
                            label={food.restaurant}
                            variant="outlined"
                            size="small"
                            sx={{
                                fontSize: '0.7rem',
                                height: 28,
                                '& .MuiChip-icon': { fontSize: 14 },
                                maxWidth: 120,
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }
                            }}
                        />
                    </Stack>

                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1.5} sx={{ mt: "auto" }}>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            size="medium"
                            onClick={handleOrderClick}
                            startIcon={<FastfoodIcon />}
                            sx={{
                                fontWeight: 600,
                                borderRadius: 2.5,
                                textTransform: "none",
                                fontSize: "0.85rem",
                                py: 1,
                                minHeight: 42,
                                boxShadow: isHovered ? 4 : 1,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: 6,
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
                                fontWeight: 600,
                                borderRadius: 2.5,
                                textTransform: "none",
                                fontSize: "0.85rem",
                                py: 1,
                                minHeight: 42,
                                borderWidth: 2,
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderWidth: 2,
                                    transform: 'translateY(-2px)',
                                    boxShadow: 2,
                                }
                            }}
                        />
                    </Stack>
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
                            borderRadius: 2,
                            fontWeight: 500
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Grow>
    );
}