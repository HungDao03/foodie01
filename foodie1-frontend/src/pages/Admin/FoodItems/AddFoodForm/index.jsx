import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Box, IconButton, useMediaQuery, Typography, Card, CardContent,
    Grid, Stack, Chip, Fade, CircularProgress, alpha, Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    Close as CloseIcon,
    CloudUpload as CloudUploadIcon,
    Restaurant as RestaurantIcon,
    AttachMoney as AttachMoneyIcon,
    Schedule as ScheduleIcon,
    Category as CategoryIcon,
    Add as AddIcon,
    PhotoCamera as PhotoCameraIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import FoodItemsService from '../../../../service/food-itemsService.js';
import CategoryService from "../../../../service/categoryService.js";

function AddFoodForm({ open, onClose, onAddSuccess }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [formData, setFormData] = useState({
        name: '',
        price: '',
        discountPrice: '',
        restaurant: '',
        deliveryTime: '',
        categoryId: '',
        image: null
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [errors, setErrors] = useState({});
    const nameInputRef = useRef(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);

            const fetchCategories = async () => {
                try {
                    const response = await CategoryService.getAllCategories();
                    setCategories(response.data);
                } catch (error) {
                    toast.error("Không thể tải danh mục");
                    console.error("Lỗi khi lấy danh mục:", error);
                }
            };

            fetchCategories();
        }
    }, [open]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Vui lòng nhập tên món ăn';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Vui lòng nhập giá lớn hơn 0';
        if (!formData.restaurant.trim()) newErrors.restaurant = 'Vui lòng nhập tên nhà hàng';
        if (!formData.deliveryTime || formData.deliveryTime <= 0) newErrors.deliveryTime = 'Vui lòng nhập thời gian giao lớn hơn 0';
        if (!formData.categoryId) newErrors.categoryId = 'Vui lòng chọn danh mục';

        if (formData.discountPrice && Number(formData.discountPrice) >= Number(formData.price)) {
            newErrors.discountPrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleImageChange = (file) => {
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Kích thước file không được vượt quá 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Chỉ được chọn file ảnh');
                return;
            }

            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(URL.createObjectURL(file));
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
            handleImageChange(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ngăn validation mặc định của form HTML
        e.target.checkValidity = () => true;

        if (!validateForm()) {
            toast.error('Vui lòng kiểm tra lại thông tin');
            return;
        }

        setLoading(true);

        try {
            const form = new FormData();
            form.append('name', formData.name);
            form.append('price', parseFloat(formData.price));
            form.append('discountPrice', parseFloat(formData.discountPrice || 0));
            form.append('restaurant', formData.restaurant);
            form.append('deliveryTime', parseInt(formData.deliveryTime));
            form.append('categoryId', parseInt(formData.categoryId));
            if (formData.image) {
                form.append('image', formData.image);
            }

            const response = await FoodItemsService.addFood(form);
            toast.success('Thêm món ăn thành công!');
            onAddSuccess(response.data);
            handleReset();
        } catch (error) {
            toast.error('Không thể thêm món ăn');
            console.error('Lỗi khi thêm món ăn:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setFormData({
            name: '',
            price: '',
            discountPrice: '',
            restaurant: '',
            deliveryTime: '',
            categoryId: '',
            image: null
        });
        setImagePreview(null);
        setErrors({});
        onClose();
    };

    const formatPrice = (price) => {
        if (!price) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const discountPercentage = formData.price && formData.discountPrice
        ? Math.round((1 - formData.discountPrice / formData.price) * 100)
        : 0;

    return (
        <Dialog
            open={open}
            onClose={handleReset}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    boxShadow: theme.shadows[10],
                    width: '100%',
                    height: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    p: 0,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white',
                    position: 'relative'
                }}
            >
                <Box sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: alpha(theme.palette.common.white, 0.2),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <AddIcon />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight="bold">
                                Thêm món ăn mới
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                Tạo món ăn mới cho menu của bạn
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={handleReset}
                    disabled={loading}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
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
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            color="primary"
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                                        >
                                            <RestaurantIcon fontSize="small" />
                                            Thông tin cơ bản
                                        </Typography>
                                        <Stack spacing={2}>
                                            <TextField
                                                inputRef={nameInputRef}
                                                autoComplete="off"
                                                label="Tên món ăn"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                error={!!errors.name}
                                                helperText={errors.name}
                                                fullWidth
                                                variant="outlined"
                                                inputProps={{ 'aria-required': true }} // Thay thế required bằng aria
                                            />
                                            <TextField
                                                autoComplete="off"
                                                label="Nhà hàng"
                                                name="restaurant"
                                                value={formData.restaurant}
                                                onChange={handleInputChange}
                                                error={!!errors.restaurant}
                                                helperText={errors.restaurant}
                                                fullWidth
                                                InputProps={{
                                                    startAdornment: <RestaurantIcon color="action" sx={{ mr: 1 }} />
                                                }}
                                                inputProps={{ 'aria-required': true }}
                                            />
                                            <FormControl fullWidth error={!!errors.categoryId}>
                                                <InputLabel>Danh mục</InputLabel>
                                                <Select
                                                    name="categoryId"
                                                    value={formData.categoryId}
                                                    onChange={handleInputChange}
                                                    label="Danh mục"
                                                    startAdornment={<CategoryIcon color="action" sx={{ mr: 1 }} />}
                                                    inputProps={{ 'aria-required': true }}
                                                >
                                                    {categories.map((category) => (
                                                        <MenuItem key={category.id} value={category.id}>
                                                            {category.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {errors.categoryId && (
                                                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                                        {errors.categoryId}
                                                    </Typography>
                                                )}
                                            </FormControl>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                <Card elevation={2} sx={{ borderRadius: 2 }}>
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            color="primary"
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                                        >
                                            <AttachMoneyIcon fontSize="small" />
                                            Giá cả & Giao hàng
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    autoComplete="off"
                                                    label="Giá gốc"
                                                    name="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={handleInputChange}
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
                                                    autoComplete="off"
                                                    label="Giá khuyến mãi"
                                                    name="discountPrice"
                                                    type="number"
                                                    value={formData.discountPrice}
                                                    onChange={handleInputChange}
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
                                                    autoComplete="off"
                                                    label="Thời gian giao hàng"
                                                    name="deliveryTime"
                                                    type="number"
                                                    value={formData.deliveryTime}
                                                    onChange={handleInputChange}
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
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            color="primary"
                                            sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
                                        >
                                            <PhotoCameraIcon fontSize="small" />
                                            Hình ảnh món ăn
                                        </Typography>

                                        {imagePreview ? (
                                            <Box sx={{ position: 'relative', mb: 2 }}>
                                                <img
                                                    src={imagePreview}
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
                                                        setImagePreview(null);
                                                        setFormData(prev => ({ ...prev, image: null }));
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
                                                    accept="image/*"
                                                    type="file"
                                                    id="upload-image"
                                                    style={{ display: 'none' }}
                                                    onChange={(e) => handleImageChange(e.target.files[0])}
                                                />
                                                <label htmlFor="upload-image" style={{ cursor: 'pointer', width: '100%', display: 'block' }}>
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

                                {formData.price && (
                                    <Card elevation={2} sx={{ borderRadius: 2 }}>
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
                                                    {formatPrice(formData.discountPrice || formData.price)}
                                                </Typography>
                                                {formData.discountPrice && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            textDecoration: 'line-through',
                                                            color: 'text.secondary'
                                                        }}
                                                    >
                                                        {formatPrice(formData.price)}
                                                    </Typography>
                                                )}
                                            </Stack>
                                            {formData.discountPrice && discountPercentage > 0 && (
                                                <Chip
                                                    label={`Giảm ${discountPercentage}%`}
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
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                        backgroundColor: theme.palette.background.default,
                        flexShrink: 0
                    }}
                >
                    <Stack direction="row" spacing={2} width="100%" justifyContent="flex-end">
                        <Button
                            onClick={handleReset}
                            color="inherit"
                            variant="outlined"
                            disabled={loading}
                            sx={{
                                minWidth: 100,
                                textTransform: 'none'
                            }}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                            sx={{
                                minWidth: 140,
                                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                                color: theme.palette.primary.contrastText,
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': {
                                    background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
                                },
                                '&:disabled': {
                                    background: theme.palette.action.disabledBackground
                                }
                            }}
                        >
                            {loading ? 'Đang thêm...' : 'Thêm món ăn'}
                        </Button>
                    </Stack>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default AddFoodForm;