import { Box, Typography, Button, useTheme } from "@mui/material";
import FoodCard from "../FoodCard/index.jsx";

export default function FoodGrid({ foods, onOrderClick, onFavoriteToggle }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(auto-fill, minmax(300px, 1fr))",
                    md: "repeat(auto-fill, minmax(320px, 1fr))",
                    lg: "repeat(auto-fill, minmax(340px, 1fr))"
                },
                gap: { xs: 3, sm: 4, md: 4, lg: 5 },
                py: 4,
                px: { xs: 2, sm: 3 },
                zIndex: 1,
                position: "relative",
            }}
        >
            {foods?.length ? (
                foods.map((food, i) => (
                    <FoodCard 
                        key={food.id || i} 
                        food={food} 
                        onOrderClick={onOrderClick}
                        onFavoriteToggle={onFavoriteToggle}
                        isFavorite={food.favorite === 1}
                    />
                ))
            ) : (
                <Box sx={{ 
                    gridColumn: '1 / -1',
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
                        background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2
                    }}>
                        <Typography variant="h1" sx={{ 
                            fontSize: '3rem',
                            color: theme.palette.primary.main,
                            opacity: 0.6
                        }}>
                            🍽️
                        </Typography>
                    </Box>
                    
                    <Typography variant="h5" sx={{ 
                        fontWeight: 600,
                        color: 'text.primary',
                        mb: 1
                    }}>
                        Không tìm thấy món ăn nào
                    </Typography>
                    
                    <Typography variant="body1" sx={{ 
                        color: 'text.secondary',
                        maxWidth: 400,
                        mb: 3,
                        opacity: 0.8
                    }}>
                        Hãy thử tìm kiếm với từ khóa khác hoặc kiểm tra lại bộ lọc của bạn
                    </Typography>
                    
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: '#fff',
                            fontWeight: 700,
                            borderRadius: 4,
                            px: 4,
                            py: 1.5,
                            boxShadow: '0 8px 24px rgba(25,118,210,0.3)',
                            textTransform: 'none',
                            fontSize: '1rem',
                            minHeight: 48,
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                color: '#fff',
                                boxShadow: '0 12px 32px rgba(25,118,210,0.4)',
                                transform: 'translateY(-2px)'
                            }
                        }}
                    >
                        Tải lại trang
                    </Button>
                </Box>
            )}
        </Box>
    );
}
