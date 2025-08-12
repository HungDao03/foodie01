import { Box, Typography, Button, useTheme } from "@mui/material";
import FoodCard from "../FoodCard/index.jsx";

export default function FoodGrid({ foods, onOrderClick }) {
    const theme = useTheme();

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 3,
                py: 3,
                zIndex: 1,
                position: "relative",
            }}
        >
            {foods?.length ? (
                foods.map((food, i) => (
                    <FoodCard key={i} food={food} onOrderClick={onOrderClick} />
                ))
            ) : (
                <Box sx={{ textAlign: 'center', py: 4, color: 'white' }}>
                    <Typography variant="h6">Không tìm thấy món ăn nào</Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.reload()}
                        sx={{
                            mt: 2,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: '#fff',
                            fontWeight: 700,
                            borderRadius: 3,
                            px: 3,
                            py: 1,
                            boxShadow: 2,
                            textTransform: 'none',
                            fontSize: '1rem',
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                color: '#fff',
                                boxShadow: 4
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
