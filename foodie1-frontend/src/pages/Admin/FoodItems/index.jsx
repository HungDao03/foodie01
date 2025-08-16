import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    CircularProgress,
    Button,
    Stack,
    useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-toastify';
import FoodItemsService from "../../../service/food-itemsService.js";
import AddFoodForm from "./AddFoodForm/index.jsx";
import EditFoodForm from "./EditFoodForm/index.jsx";
import useSearchStore from "../../../components/store/searchStore.jsx";
import FoodCard from "../../../components/list/FoodCard/index.jsx";

function FoodItems() {
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingFood, setEditingFood] = useState(null);
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);
    const { searchResults, searchKeyword } = useSearchStore();
    const theme = useTheme();

    useEffect(() => {
        const loadFoods = async () => {
            try {
                const response = await FoodItemsService.getAllFoods();
                setFoods(response.data);
            } catch (error) {
                toast.error('Không thể tải danh sách món ăn');
            } finally {
                setLoading(false);
            }
        };
        loadFoods();
    }, []);

    const reloadFoods = async () => {
        try {
            const response = await FoodItemsService.getAllFoods();
            setFoods(response.data);
        } catch (error) {
            toast.error('Không thể tải lại danh sách món ăn');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc muốn xóa món ăn này?')) {
            try {
                await FoodItemsService.deleteFood(id);
                setFoods((prev) => prev.filter((f) => f.id !== id));
                toast.success('Đã xóa món ăn');
            } catch (error) {
                toast.error('Lỗi khi xóa món ăn');
            }
        }
    };

    const handleAddSuccess = (newFood) => setFoods((prev) => [...prev, newFood]);
    const handleEditSuccess = () => reloadFoods();

    const handleEditClick = (food) => {
        // Trong admin, khi click vào card sẽ mở form edit
        setEditingFood(food);
    };

        if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Box sx={{
                    textAlign: 'center',
                    padding: '40px',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '20px',
                    boxShadow: theme.shadows[8],
                    border: `1px solid ${theme.palette.divider}`
                }}>
                    <CircularProgress size={60} sx={{ color: theme.palette.primary.main, mb: 2 }} />
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            marginTop: '16px'
                        }}
                    >
                        Đang tải danh sách món ăn...
                    </Typography>
                </Box>
            </Box>
        );
    }

    const displayFoods = searchKeyword ? searchResults : foods;

    return (
        <Box sx={{ 
            p: 4, 
            backgroundColor: theme.palette.background.default,
            minHeight: '100vh'
        }}>
            <Container maxWidth="xl">
                {/* Header Section */}
                <Box sx={{ 
                    marginBottom: "40px",
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <Typography
                        variant="h1"
                        sx={{ 
                            fontSize: "3.5rem", 
                            fontWeight: "900", 
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: "0 0 16px 0",
                            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        🍽️ Quản lý món ăn
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ 
                            color: theme.palette.text.secondary, 
                            fontSize: "1.25rem", 
                            margin: 0,
                            fontWeight: 500,
                            opacity: 0.8,
                            maxWidth: '600px',
                            margin: '0 auto'
                        }}
                    >
                        Quản lý và theo dõi tất cả món ăn trong hệ thống
                    </Typography>
                </Box>

                {/* Search Results Info */}
                {searchKeyword && (
                    <Box sx={{
                        marginBottom: '24px',
                        padding: '16px 24px',
                        backgroundColor: theme.palette.background.paper,
                        borderRadius: '16px',
                        border: `1px solid ${theme.palette.primary.main}20`,
                        textAlign: 'center'
                    }}>
                        <Typography sx={{
                            color: theme.palette.text.primary,
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                animation: 'pulse 2s infinite'
                            }} />
                            🔍 Kết quả tìm kiếm cho "{searchKeyword}"
                        </Typography>
                    </Box>
                )}

                {/* Add Food Button */}
                <Box sx={{
                    marginBottom: '32px',
                    textAlign: 'center'
                }}>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddFormOpen(true)}
                        sx={{
                            height: 56,
                            px: 4,
                            borderRadius: '28px',
                            textTransform: 'none',
                            fontSize: '1.1rem',
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                transform: 'translateY(-2px)',
                                boxShadow: `0 12px 40px ${theme.palette.primary.main}60`
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                    >
                         Thêm món ăn mới
                    </Button>
                </Box>

                {/* Food Items Grid */}
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '24px',
                    padding: '24px',
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: '20px',
                    boxShadow: theme.shadows[8],
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'opacity 0.3s ease-in-out',
                    opacity: searchKeyword && !displayFoods.length ? 0.5 : 1,
                }}>
                    {displayFoods.length > 0 ? (
                        displayFoods.map((food) => (
                            <div key={food.id} style={{ 
                                position: 'relative',
                                zIndex: 1,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                                e.currentTarget.style.zIndex = 2;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                                e.currentTarget.style.zIndex = 1;
                            }}>
                                {/* FoodCard Component với Admin Mode */}
                                <FoodCard 
                                    food={food} 
                                    onOrderClick={handleEditClick}
                                    hideActionButtons={true}
                                    isAdmin={true}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))
                    ) : (
                        <Box sx={{ 
                            gridColumn: '1 / -1',
                            textAlign: 'center', 
                            padding: '60px 40px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '24px',
                            position: 'relative',
                            zIndex: 1
                        }}>
                            <Box sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                backgroundColor: theme.palette.action.hover,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '16px',
                                border: `2px solid ${theme.palette.primary.main}30`
                            }}>
                                <Box sx={{ 
                                    fontSize: '3rem',
                                    opacity: 0.8
                                }}>
                                    🍽️
                                </Box>
                            </Box>
                            
                            <Typography sx={{ 
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: theme.palette.text.primary,
                                marginBottom: '8px'
                            }}>
                                {searchKeyword ? `Không tìm thấy món ăn nào cho "${searchKeyword}"` : 'Không có món ăn nào'}
                            </Typography>
                            
                            {!searchKeyword && (
                                <Typography sx={{ 
                                    fontSize: '1.1rem',
                                    color: theme.palette.text.secondary,
                                    maxWidth: 400,
                                    marginBottom: '24px',
                                    opacity: 0.8,
                                    lineHeight: 1.5
                                }}>
                                    Hãy thêm món ăn đầu tiên để bắt đầu quản lý
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
            </Container>

            <AddFoodForm
                open={isAddFormOpen}
                onClose={() => setIsAddFormOpen(false)}
                onAddSuccess={handleAddSuccess}
            />
            <EditFoodForm
                open={!!editingFood}
                onClose={() => setEditingFood(null)}
                food={editingFood}
                onEditSuccess={handleEditSuccess}
            />
            

        </Box>
    );
}

export default FoodItems;