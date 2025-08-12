import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Grid,
    Card,
    CardContent,
    Chip,
    Avatar,
    Fade,
    CircularProgress,
    Alert,
    Tooltip,
    Stack,
    Divider,
    useTheme,
    alpha
} from '@mui/material';
import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Restaurant as RestaurantIcon,
    Schedule as ScheduleIcon,
    AttachMoney as AttachMoneyIcon,
    Category as CategoryIcon,
    Image as ImageIcon,
    Save as SaveIcon,
    Cancel as CancelIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';

import FoodItemsService from "../../../../service/food-itemsService.js";
import AdminService from "../../../../service/adminservice.js";
import CategoryService from "../../../../service/categoryService.js";

function EditFoodForm({ open, onClose, food, onEditSuccess }) {
    const theme = useTheme();
    const [foodData, setFoodData] = useState({
        name: '',
        price: '',
        discountPrice: '',
        restaurant: '',
        deliveryTime: '',
        categoryId: '',
        image: null,
    });

    const [categories, setCategories] = useState([]);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [errors, setErrors] = useState({});
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (open) {
            setLoadingCategories(true);
            CategoryService.getAllCategories()
                .then((res) => {
                    setCategories(res.data || []);
                    setLoadingCategories(false);
                })
                .catch(() => {
                    toast.error("Không thể tải danh mục");
                    setLoadingCategories(false);
                });

            if (food) {
                setFoodData({
                    name: food.name || '',
                    price: Number(food.price) || '',
                    discountPrice: Number(food.discountPrice) || '',
                    restaurant: food.restaurant || '',
                    deliveryTime: Number(food.deliveryTime) || '',
                    categoryId: food.category ? String(food.category.id) : '',
                    image: null,
                });

                setPreviewUrl(getImageUrl(food.imageUrl));
            }
        }
    }, [open, food]);

    const validateForm = () => {
        const newErrors = {};

        if (!foodData.name.trim()) newErrors.name = 'Vui lòng nhập tên món ăn';
        if (!foodData.price || foodData.price <= 0) newErrors.price = 'Vui lòng nhập giá lớn hơn 0';
        if (!foodData.restaurant.trim()) newErrors.restaurant = 'Vui lòng nhập tên nhà hàng';
        if (!foodData.deliveryTime || foodData.deliveryTime <= 0) newErrors.deliveryTime = 'Vui lòng nhập thời gian giao lớn hơn 0';
        if (!foodData.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục';

        if (
            foodData.discountPrice &&
            Number(foodData.discountPrice) >= Number(foodData.price)
        ) {
            newErrors.discountPrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        const numericFields = ['price', 'discountPrice', 'deliveryTime'];
        const parsedValue = numericFields.includes(name) ? Number(value) : value;

        setFoodData((prev) => ({
            ...prev,
            [name]: parsedValue
        }));

        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Chỉ được chọn file ảnh');
                return;
            }

            setFoodData((prev) => ({ ...prev, image: file }));
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.target.checkValidity = () => true;

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('name', foodData.name.trim());
            formData.append('price', foodData.price);
            if (foodData.discountPrice) {
                formData.append('discountPrice', foodData.discountPrice);
            }
            formData.append('restaurant', foodData.restaurant.trim());
            formData.append('deliveryTime', foodData.deliveryTime);
            formData.append('categoryId', foodData.categoryId);
            if (foodData.image) {
                formData.append('image', foodData.image);
            }

            const response = await FoodItemsService.updateFood(food.id, formData);

            const updatedFood = {
                ...response.data,
                category: categories.find((cat) => String(cat.id) === foodData.categoryId) || { id: foodData.categoryId, name: 'Danh mục' }
            };

            toast.success('Cập nhật món ăn thành công');
            onEditSuccess(updatedFood);
            onClose();
        } catch (error) {
            console.error('Lỗi khi cập nhật món ăn:', error);
            toast.error('Không thể cập nhật món ăn');
        } finally {
            setLoading(false);
        }
    };

    const getImageUrl = (imageUrl) => {
        if (!imageUrl) return null;
        if (imageUrl.startsWith('http')) return imageUrl;
        return `http://localhost:8080/uploads/food/${imageUrl}`;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const handleClose = () => {
        if (loading) return;
        setErrors({});
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    boxShadow: theme.shadows[10],
                    width: '100%',
                    height: 'auto',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 3,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    position: 'relative'
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <RestaurantIcon />
                    <Typography variant="h6" fontWeight="bold">
                        Chỉnh sửa món ăn
                    </Typography>
                </Box>
                <IconButton
                    onClick={handleClose}
                    disabled={loading}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: 'white',
                        '&:hover': {
                            backgroundColor: alpha(theme.palette.common.white, 0.1)
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit} noValidate>
                <DialogContent
                    dividers
                    sx={{
                        p: 3,
                        maxHeight: '70vh',
                        overflowY: 'auto',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                        <Grid item xs={12} md={8}>
                            <Stack spacing={3} sx={{ flexGrow: 1 }}>
                                <Card elevation={2} sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <RestaurantIcon fontSize="small" />
                                            Thông tin cơ bản
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Tên món ăn"
                                                    name="name"
                                                    value={foodData.name}
                                                    onChange={handleChange}
                                                    error={!!errors.name}
                                                    helperText={errors.name}
                                                    fullWidth
                                                    variant="outlined"
                                                    inputProps={{ 'aria-required': true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Nhà hàng"
                                                    name="restaurant"
                                                    value={foodData.restaurant}
                                                    onChange={handleChange}
                                                    error={!!errors.restaurant}
                                                    helperText={errors.restaurant}
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: <RestaurantIcon color="action" sx={{ mr: 1 }} />
                                                    }}
                                                    inputProps={{ 'aria-required': true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth error={!!errors.categoryId}>
                                                    <InputLabel>Danh mục</InputLabel>
                                                    <Select
                                                        name="categoryId"
                                                        value={foodData.categoryId}
                                                        onChange={handleChange}
                                                        label="Danh mục"
                                                        startAdornment={<CategoryIcon color="action" sx={{ mr: 1 }} />}
                                                        inputProps={{ 'aria-required': true }}
                                                    >
                                                        {loadingCategories ? (
                                                            <MenuItem disabled>
                                                                <CircularProgress size={20} sx={{ mr: 2 }} />
                                                                Đang tải...
                                                            </MenuItem>
                                                        ) : (
                                                            categories.map((cat) => (
                                                                <MenuItem key={cat.id} value={String(cat.id)}>
                                                                    {cat.name}
                                                                </MenuItem>
                                                            ))
                                                        )}
                                                    </Select>
                                                    {errors.categoryId && (
                                                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                            {errors.categoryId}
                                                        </Typography>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                <Card elevation={2} sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <AttachMoneyIcon fontSize="small" />
                                            Giá cả & Giao hàng
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Giá gốc"
                                                    name="price"
                                                    type="number"
                                                    value={foodData.price}
                                                    onChange={handleChange}
                                                    error={!!errors.price}
                                                    helperText={errors.price}
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: <Typography color="text.secondary">VND</Typography>
                                                    }}
                                                    inputProps={{ 'aria-required': true }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    label="Giá khuyến mãi"
                                                    name="discountPrice"
                                                    type="number"
                                                    value={foodData.discountPrice}
                                                    onChange={handleChange}
                                                    error={!!errors.discountPrice}
                                                    helperText={errors.discountPrice}
                                                    fullWidth
                                                    InputProps={{
                                                        endAdornment: <Typography color="text.secondary">VND</Typography>
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="Thời gian giao hàng"
                                                    name="deliveryTime"
                                                    type="number"
                                                    value={foodData.deliveryTime}
                                                    onChange={handleChange}
                                                    error={!!errors.deliveryTime}
                                                    helperText={errors.deliveryTime}
                                                    fullWidth
                                                    InputProps={{
                                                        startAdornment: <ScheduleIcon color="action" sx={{ mr: 1 }} />,
                                                        endAdornment: <Typography color="text.secondary">phút</Typography>
                                                    }}
                                                    inputProps={{ 'aria-required': true }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <Stack spacing={2}>
                                <Card elevation={2} sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <ImageIcon fontSize="small" />
                                            Hình ảnh
                                        </Typography>

                                        {previewUrl ? (
                                            <Box sx={{ position: 'relative', mb: 2 }}>
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        height: 200,
                                                        objectFit: 'cover',
                                                        borderRadius: 8,
                                                        border: `2px solid ${theme.palette.divider}`
                                                    }}
                                                />
                                                <IconButton
                                                    onClick={() => {
                                                        setPreviewUrl(null);
                                                        setFoodData((prev) => ({ ...prev, image: null }));
                                                    }}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: 8,
                                                        right: 8,
                                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                                        color: '#fff',
                                                        width: 32,
                                                        height: 32,
                                                        '&:hover': {
                                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                                            transform: 'scale(1.1)'
                                                        }
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box
                                                onDragEnter={handleDrag}
                                                onDragLeave={handleDrag}
                                                onDragOver={handleDrag}
                                                onDrop={handleDrop}
                                                sx={{
                                                    border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
                                                    borderRadius: 2,
                                                    p: 3,
                                                    textAlign: 'center',
                                                    backgroundColor: dragActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                                                    transition: 'all 0.2s ease',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                        borderColor: theme.palette.primary.main
                                                    }
                                                }}
                                            >
                                                <input
                                                    type="file"
                                                    hidden
                                                    id="file-input"
                                                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                                                    accept="image/*"
                                                />
                                                <label htmlFor="file-input" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
                                                    <CloudUploadIcon
                                                        sx={{
                                                            fontSize: 40,
                                                            color: dragActive ? 'primary.main' : 'text.secondary',
                                                            mb: 1
                                                        }}
                                                    />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Kéo thả hoặc click để chọn ảnh
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        (Tối đa 5MB)
                                                    </Typography>
                                                </label>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>

                                {foodData.price && (
                                    <Card elevation={2} sx={{ borderRadius: 2, mt: 2 }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom color="primary">
                                                Xem trước giá
                                            </Typography>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography
                                                    variant="h6"
                                                    color="primary"
                                                    fontWeight="bold"
                                                >
                                                    {formatPrice(foodData.discountPrice || foodData.price)}
                                                </Typography>
                                                {foodData.discountPrice && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textDecoration: 'line-through',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        {formatPrice(foodData.price)}
                                                    </Typography>
                                                )}
                                            </Stack>
                                            {foodData.discountPrice && (
                                                <Chip
                                                    label={`Giảm ${Math.round((1 - foodData.discountPrice / foodData.price) * 100)}%`}
                                                    color="error"
                                                    size="small"
                                                    sx={{ mt: 1 }}
                                                />
                                            )}
                                        </CardContent>
                                    </Card>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 3 }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            disabled={loading}
                            startIcon={<CancelIcon />}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                                minWidth: 120,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                                '&:hover': {
                                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                                }
                            }}
                        >
                            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                        </Button>
                    </Stack>
                </DialogContent>
            </form>
        </Dialog>
    );
}

export default EditFoodForm;