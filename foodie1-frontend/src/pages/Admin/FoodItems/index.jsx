import { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Container,
    CircularProgress,
    Button,
    Stack,
    Paper,
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

    const getFoodImageUrl = (url) => {
        if (!url) return 'https://placehold.co/300x200/png?text=Food+Image';
        if (url.startsWith('http')) return url;
        return `http://localhost:8080/uploads/food/${url}`;
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
                        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                        gap: 4,
                        transition: 'opacity 0.3s ease-in-out',
                        opacity: searchKeyword && !displayFoods.length ? 0.5 : 1,
                    }}
                >
                    {displayFoods.length > 0 ? (
                        displayFoods.map((food) => (
                            <Paper
                                key={food.id}
                                elevation={4}
                                sx={{
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    transition: 'transform 0.25s ease, opacity 0.3s ease',
                                    bgcolor: 'background.paper',
                                    '&:hover': {
                                        transform: 'translateY(-5px)',
                                        boxShadow: theme.shadows[6],
                                    },
                                }}
                            >
                                <Box sx={{ height: 180, overflow: 'hidden' }}>
                                    <img
                                        src={getFoodImageUrl(food.imageUrl)}
                                        alt={food.name}
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/300x200/png?text=Food+Image';
                                        }}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'opacity 0.3s ease',
                                        }}
                                    />
                                </Box>

                                <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <Typography variant="h6" fontWeight={600} noWrap title={food.name} color="text.primary">
                                        {food.name}
                                    </Typography>

                                    <Typography variant="body2" mt={0.5} color="text.primary">
                                        Giá:{' '}
                                        {food.discountPrice > 0 ? (
                                            <>
                                                <b>{food.discountPrice.toLocaleString()}đ</b>
                                                <Typography
                                                    component="span"
                                                    sx={{
                                                        ml: 1,
                                                        textDecoration: 'line-through',
                                                        color: 'text.disabled',
                                                    }}
                                                >
                                                    {food.price.toLocaleString()}đ
                                                </Typography>
                                            </>
                                        ) : (
                                            <b>{food.price.toLocaleString()}đ</b>
                                        )}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary" mt={1}>
                                        Nhà hàng: {food.restaurant}
                                        <br />
                                        Giao: {food.deliveryTime} phút
                                        <br />
                                        Danh mục: {food.categoryName || 'Chưa có'}
                                    </Typography>

                                    <Stack direction="row" spacing={1} mt="auto" pt={2}>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="primary"
                                            startIcon={<EditIcon />}
                                            onClick={() => setEditingFood(food)}
                                        >
                                            Sửa
                                        </Button>
                                        <Button
                                            fullWidth
                                            variant="outlined"
                                            color="error"
                                            startIcon={<DeleteIcon />}
                                            onClick={() => handleDelete(food.id)}
                                        >
                                            Xóa
                                        </Button>
                                    </Stack>
                                </Box>
                            </Paper>
                        ))
                    ) : (
                        <Typography variant="h6" color="text.secondary" sx={{ textAlign: 'center', width: '100%' }}>
                            {searchKeyword ? `Không tìm thấy món ăn nào cho "${searchKeyword}"` : 'Không có món ăn nào'}
                        </Typography>
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