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
                console.log('All foods:', response.data);
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
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    const displayFoods = searchKeyword ? searchResults : foods;

    return (
        <Box sx={{ py: 4, bgcolor: 'background.default' }}>
            <Container maxWidth="xl">
                <Box
                    sx={{
                        mb: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Typography variant="h4" fontWeight="bold" color="primary.dark">
                        Quản lý món ăn
                        {searchKeyword && (
                            <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 2 }}>
                                Kết quả tìm kiếm cho "{searchKeyword}"
                            </Typography>
                        )}
                    </Typography>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsAddFormOpen(true)}
                        sx={{
                            height: 48,
                            px: 3,
                            borderRadius: '999px',
                            textTransform: 'none',
                        }}
                    >
                        Thêm món ăn
                    </Button>
                </Box>

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
                        px: { xs: 2, sm: 3 },
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: searchKeyword && !displayFoods.length ? 0.5 : 1,
                    }}
                >
                    {displayFoods.length > 0 ? (
                        displayFoods.map((food) => (
                            <Box key={food.id} sx={{ position: 'relative' }}>
                                {/* FoodCard Component với Admin Mode */}
                                <FoodCard 
                                    food={food} 
                                    onOrderClick={handleEditClick}
                                    hideActionButtons={true}
                                    isAdmin={true}
                                    onDelete={handleDelete}
                                />
                            </Box>
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
                                {searchKeyword ? `Không tìm thấy món ăn nào cho "${searchKeyword}"` : 'Không có món ăn nào'}
                            </Typography>
                            
                            {!searchKeyword && (
                                <Typography variant="body1" sx={{ 
                                    color: 'text.secondary',
                                    maxWidth: 400,
                                    mb: 3,
                                    opacity: 0.8
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