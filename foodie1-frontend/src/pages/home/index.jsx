import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Container,
    Grid,
    Card,
    CardContent,
    CardMedia,
    Box,
} from "@mui/material";
import { styled, useTheme } from '@mui/material/styles';
import { AccessTime, LocationOn, Phone, Whatshot } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FoodItemsService from "../../service/food-itemsService.js";
import LoginModal from "../../components/LoginModal";
import RegisterModal from "../../components/RegisterModal";
import useThemeStore from "../../components/store/dark-light.jsx";


// Styled components để tăng tính nổi bật
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: theme.palette.background.paper,
    boxShadow: `0 2px 8px ${theme.palette.primary.main}20`,
    transition: 'all 0.3s ease',
}));

const StyledButton = styled(Button)(({ theme }) => ({
    color: theme.palette.text.primary,
    fontWeight: 600,
    borderRadius: theme.shape.borderRadius,
    '&:hover': {
        backgroundColor: `${theme.palette.primary.main}10`,
        color: theme.palette.primary.main,
    },
    transition: 'all 0.2s ease',
}));

const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    padding: theme.spacing(6, 0),
    transition: 'all 0.3s ease',
}));

const HeroButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
    color: theme.palette.primary.main,
    fontWeight: 800,
    boxShadow: `0 6px 24px ${theme.palette.primary.main}25`,
    borderRadius: theme.shape.borderRadius * 2,
    padding: theme.spacing(2, 5),
    fontSize: '1.2rem',
    letterSpacing: '1px',
    textShadow: `0 2px 8px ${theme.palette.primary.main}20`,
    '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette.text.secondary} 0%, ${theme.palette.text.primary} 100%)`,
        color: theme.palette.primary.dark,
        transform: 'translateY(-2px)',
    },
    transition: 'all 0.3s ease',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    borderRadius: theme.shape.borderRadius * 2.5,
    boxShadow: `0 4px 16px ${theme.palette.primary.main}15`,
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: `0 8px 32px ${theme.palette.primary.main}25`,
        transform: 'translateY(-4px)',
    },
}));

const CategoryButton = styled(Button)(({ theme }) => ({
    fontWeight: 600,
    color: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: `${theme.palette.primary.main}10`,
    },
    transition: 'all 0.2s ease',
}));

const StatsSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 0),
    background: theme.palette.primary.main,
    color: theme.palette.text.primary,
}));

const FooterSection = styled(Box)(({ theme }) => ({
    padding: theme.spacing(4, 0),
    background: theme.palette.mode === 'dark' ? '#1d1d1d' : '#111827',
    color: theme.palette.text.primary,
}));

export default function Homepage() {
    const [category1Foods, setCategory1Foods] = useState([]);
    const [category2Foods, setCategory2Foods] = useState([]);
    const [openLogin, setOpenLogin] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [showAllCategory1, setShowAllCategory1] = useState(false);
    const [showAllCategory2, setShowAllCategory2] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const { isDarkMode } = useThemeStore();

    // Fetch món ăn theo danh mục khi component mount
    useEffect(() => {
        const fetchFoodsByCategory = async () => {
            try {
                const response1 = await FoodItemsService.getFoodsByCategory(1);
                setCategory1Foods(response1.data);

                const response2 = await FoodItemsService.getFoodsByCategory(2);
                setCategory2Foods(response2.data);
            } catch (error) {
                console.error("Lỗi khi lấy món ăn theo danh mục:", error);
            }
        };
        fetchFoodsByCategory();

        // Xử lý toast từ query parameter khi tải trang
        const params = new URLSearchParams(location.search);
        const message = params.get("message");
        if (message) {
            toast.success(message, {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                theme: isDarkMode ? 'dark' : 'light',
                onClose: () => {
                    navigate("/", { replace: true });
                },
            });
        }
    }, [location, navigate, isDarkMode]);

    // Mở/đóng modal
    const handleOpenLogin = () => setOpenLogin(true);
    const handleCloseLogin = () => setOpenLogin(false);
    const handleOpenRegister = () => setOpenRegister(true);
    const handleCloseRegister = () => setOpenRegister(false);

    // Chuyển đổi giữa modal login/register
    const switchToRegister = () => {
        handleCloseLogin();
        handleOpenRegister();
    };
    const switchToLogin = () => {
        handleCloseRegister();
        handleOpenLogin();
    };

    return (
        <>
            {/* Header */}
            <StyledAppBar position="sticky">
                <Toolbar>
                    <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
                        <img src="/logofoodie.png" alt="Foodie Logo" style={{ width: 70, height: 70, marginRight: 6 }} />
                    </Box>

                    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3, mr: 3 }}>
                        <StyledButton>Trang chủ</StyledButton>
                        <StyledButton>Liên hệ</StyledButton>
                        <StyledButton onClick={handleOpenLogin}>Đăng nhập</StyledButton>
                        <StyledButton onClick={handleOpenRegister}>Đăng ký</StyledButton>
                    </Box>
                </Toolbar>
            </StyledAppBar>

            {/* Modal đăng nhập / đăng ký */}
            <LoginModal open={openLogin} onClose={handleCloseLogin} onRegisterClick={switchToRegister} />
            <RegisterModal open={openRegister} onClose={handleCloseRegister} onLoginClick={switchToLogin} />

            {/* Hero section */}
            <HeroSection>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: "center", maxWidth: 600, mx: "auto" }}>
                        <Typography
                            variant="h3"
                            sx={{
                                mb: 2,
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                textShadow: `0 2px 8px ${theme.palette.primary.main}15`,
                            }}
                        >
                            Khám phá{" "}
                            <Box component="span" sx={{
                                background: `linear-gradient(135deg, ${theme.palette.text.primary} 0%, ${theme.palette.text.secondary} 100%)`,
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                fontWeight: 800,
                            }}>
                                hương vị
                            </Box>{" "}đặc sắc
                        </Typography>

                        <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                            Thưởng thức những món ăn ngon nhất với nguyên liệu tươi ngon mỗi ngày
                        </Typography>

                        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                            <HeroButton
                                onClick={handleOpenLogin}
                                variant="contained"
                                size="large"
                            >
                                Đặt món ngay
                            </HeroButton>
                        </Box>
                    </Box>
                </Container>
            </HeroSection>

            {/* Danh sách món ăn */}
            <Box sx={{ py: 6, bgcolor: 'background.default' }}>
                <Container maxWidth="lg">
                    {/* Hàng 1 - Danh mục 1 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Whatshot sx={{ color: theme.palette.error.main, fontSize: '2.5rem' }} />
                            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                Best Seller
                            </Typography>
                        </Box>
                        {category1Foods.length > 4 && (
                            <CategoryButton
                                onClick={() => setShowAllCategory1(!showAllCategory1)}
                            >
                                {showAllCategory1 ? 'Thu gọn' : 'Xem tất cả'}
                            </CategoryButton>
                        )}
                    </Box>

                    <Grid container spacing={3} sx={{ mb: 6 }}>
                        {(showAllCategory1 ? category1Foods : category1Foods.slice(0, 4)).map((dish) => (
                            <Grid item xs={12} sm={6} md={3} key={dish.id}>
                                <StyledCard>
                                    <CardMedia component="img" height="160" image={dish.imageUrl} alt={dish.name} />
                                    <CardContent sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
                                        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                                            {dish.name}
                                        </Typography>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                fontSize: "1.2rem"
                                            }}>
                                                {dish.price?.toLocaleString("vi-VN")}đ
                                            </Typography>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <AccessTime sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                    {dish.deliveryTime} phút
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                {dish.restaurant}
                                            </Typography>
                                            <StyledButton
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                    color: theme.palette.text.primary,
                                                    fontWeight: 700,
                                                    borderRadius: theme.shape.borderRadius * 1.5,
                                                    px: 2,
                                                    py: 0.5,
                                                    fontSize: "1rem",
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                        transform: 'translateY(-2px)',
                                                    }
                                                }}
                                            >
                                                Đặt món
                                            </StyledButton>
                                        </Box>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Hàng 2 - Danh mục 2 */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Whatshot sx={{ color: theme.palette.error.main, fontSize: '2.5rem' }} />
                            <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                Món mới
                            </Typography>
                        </Box>
                        {category2Foods.length > 4 && (
                            <CategoryButton
                                onClick={() => setShowAllCategory2(!showAllCategory2)}
                            >
                                {showAllCategory2 ? 'Thu gọn' : 'Xem tất cả'}
                            </CategoryButton>
                        )}
                    </Box>

                    <Grid container spacing={3}>
                        {(showAllCategory2 ? category2Foods : category2Foods.slice(0, 4)).map((dish) => (
                            <Grid item xs={12} sm={6} md={3} key={dish.id}>
                                <StyledCard>
                                    <CardMedia component="img" height="160" image={dish.imageUrl} alt={dish.name} />
                                    <CardContent sx={{ p: 2, bgcolor: theme.palette.background.paper }}>
                                        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                                            {dish.name}
                                        </Typography>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                                            <Typography variant="h6" sx={{
                                                fontWeight: 700,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                                fontSize: "1.2rem"
                                            }}>
                                                {dish.price?.toLocaleString("vi-VN")}đ
                                            </Typography>

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                <AccessTime sx={{ fontSize: 14, color: theme.palette.text.secondary }} />
                                                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                                    {dish.deliveryTime} phút
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                                {dish.restaurant}
                                            </Typography>
                                            <StyledButton
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                    color: theme.palette.text.primary,
                                                    fontWeight: 700,
                                                    borderRadius: theme.shape.borderRadius * 1.5,
                                                    px: 2,
                                                    py: 0.5,
                                                    fontSize: "1rem",
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                                        transform: 'translateY(-2px)',
                                                    }
                                                }}
                                            >
                                                Đặt món
                                            </StyledButton>
                                        </Box>
                                    </CardContent>
                                </StyledCard>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>

            {/* Thống kê */}
            <StatsSection>
                <Container maxWidth="lg">
                    <Grid container spacing={2} sx={{ textAlign: "center" }}>
                        <Grid item xs={3}>
                            <Typography variant="h4" fontWeight={700}>1K+</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Khách hàng</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h4" fontWeight={700}>150+</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Món ăn</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h4" fontWeight={700}>50+</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Đầu bếp</Typography>
                        </Grid>
                        <Grid item xs={3}>
                            <Typography variant="h4" fontWeight={700}>4.8</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>Đánh giá</Typography>
                        </Grid>
                    </Grid>
                </Container>
            </StatsSection>

            {/* Footer */}
            <FooterSection>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <img src="/logofoodie.png" alt="Foodie Logo" style={{ width: 70, height: 70, marginRight: 6 }} />
                                <Typography variant="h6" fontWeight={700} sx={{ color: theme.palette.text.primary }}>
                                    Foodie
                                </Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                Trải nghiệm ẩm thực tuyệt vời
                            </Typography>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <LocationOn sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    123 Đường ABC, Q1, TP.HCM
                                </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Phone sx={{ fontSize: 16, color: theme.palette.text.secondary }} />
                                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                    0123 456 789
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={12} md={4} sx={{ textAlign: { xs: "center", md: "right" } }}>
                            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                                © 2024 Foodie. All rights reserved.
                            </Typography>
                        </Grid>
                    </Grid>
                </Container>
            </FooterSection>
        </>
    );
}