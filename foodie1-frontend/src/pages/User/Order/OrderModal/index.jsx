import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    IconButton,
    CircularProgress,
    Grid,
    Paper,
    Avatar,
    Divider,
    InputAdornment
} from '@mui/material';
import {
    Close as CloseIcon,
    ShoppingCart as ShoppingCartIcon,
    Remove as RemoveIcon,
    Add as AddIcon,
    LocationOn as LocationOnIcon,
    Phone as PhoneIcon,
    StickyNote2 as NoteIcon
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

import { useNavigate } from 'react-router-dom';
import OrderService from "../../../../service/orderService.js";

function OrderModal({ open, onClose, foodItem, userInfo }) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [orderData, setOrderData] = useState({
        quantity: 1,
        deliveryAddress: '',
        phoneNumber: '',
        notes: '',
        paymentStatus : 'NOT_PAID',
        price: 0,
        discountPrice: 0,
        paymentMethod: 'COD'


    });

    useEffect(() => {
        if (foodItem) {
            setOrderData(prev => ({
                ...prev,
                price: foodItem.price || 0,
                discountPrice: foodItem.discountPrice || foodItem.price || 0
            }));
        }
        if (userInfo) {
            setOrderData(prev => ({
                ...prev,
                deliveryAddress: userInfo.address || '',
                phoneNumber: userInfo.phoneNumber || '',
                paymentMethod: userInfo.paymentMethod || 'COD'
            }));
        }
    }, [foodItem, userInfo]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setOrderData(prev => ({
            ...prev,
            [name]: value
        }));

        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: false
            }));
        }
    };

    const handleQuantityChange = (newQuantity) => {
        const quantity = Math.max(1, newQuantity);
        setOrderData(prev => ({
            ...prev,
            quantity: quantity
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!orderData.deliveryAddress.trim()) {
            newErrors.deliveryAddress = true;
        }

        if (!orderData.phoneNumber.trim()) {
            newErrors.phoneNumber = true;
        } else if (!/^[0-9]{10,11}$/.test(orderData.phoneNumber.replace(/\s/g, ''))) {
            newErrors.phoneNumber = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateTotal = () => {
        if (!foodItem) return 0;
        const basePrice = foodItem.discountPrice || foodItem.price || 0;
        return basePrice * orderData.quantity;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            toast.error('Vui lòng điền đầy đủ thông tin hợp lệ!');
            return;
        }

        setLoading(true);
        try {
            const response = await OrderService.createOrder({
                foodItemId: foodItem.id,
                quantity: orderData.quantity,
                deliveryAddress: orderData.deliveryAddress,
                phoneNumber: orderData.phoneNumber,
                notes: orderData.notes,
                totalAmount: calculateTotal(),
                price: foodItem.price || 0,
                paymentStatus: orderData.paymentStatus,
                discountPrice: foodItem.discountPrice || foodItem.price || 0,
                paymentMethod: orderData.paymentMethod,
                imageUrl: foodItem.imageUrl || orderData.imageUrl,
            });
            if (response.data) {
                toast.success('Đặt hàng thành công!');
                onClose();
                navigate('/user/history');
            }
        } catch (error) {
            if (error.response?.status === 401) {
                toast.error("Bạn cần đăng nhập để đặt hàng!");
                navigate("/login"); // hoặc trang homepage
            } else {
                toast.error("Có lỗi xảy ra khi đặt hàng!");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!foodItem) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    bgcolor: 'background.paper',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle
                sx={{
                    m: 0,
                    p: 3,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    position: 'relative'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShoppingCartIcon sx={{ fontSize: 28 }} />
                    <Typography component="span" variant="h5" fontWeight="600">
                        Đặt hàng
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 12,
                        top: 12,
                        color: 'inherit',
                        bgcolor: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: 2,
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.2)',
                            transform: 'scale(1.05)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>


            <DialogContent dividers sx={{ p: 3 }}>
                <Paper sx={{
                    mb: 3,
                    p: 3,
                    bgcolor: 'grey.50',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                    }
                }} elevation={0}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {foodItem.imageUrl && (
                            <Avatar
                                src={foodItem.imageUrl}
                                alt={foodItem.name}
                                sx={{
                                    width: 70,
                                    height: 70,
                                    borderRadius: 3,
                                    border: '3px solid',
                                    borderColor: 'background.paper',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                                variant="rounded"
                            />
                        )}
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" gutterBottom>
                                {foodItem.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    {(foodItem.discountPrice || foodItem.price)?.toLocaleString('vi-VN')}đ
                                </Typography>
                                {foodItem.price && foodItem.discountPrice && foodItem.price > foodItem.discountPrice && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ textDecoration: 'line-through' }}
                                    >
                                        {foodItem.price.toLocaleString('vi-VN')}đ
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Paper>

                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary" gutterBottom fontWeight="500">
                            Số lượng
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            width: 'fit-content'
                        }}>
                            <IconButton
                                onClick={() => handleQuantityChange(orderData.quantity - 1)}
                                disabled={orderData.quantity <= 1}
                                size="small"
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                        transform: 'scale(1.1)'
                                    },
                                    '&:disabled': {
                                        bgcolor: 'grey.300',
                                        color: 'grey.500'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <RemoveIcon />
                            </IconButton>

                            <TextField
                                value={orderData.quantity}
                                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                                type="number"
                                size="small"
                                sx={{
                                    width: 80,
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        fontWeight: 'bold',
                                        fontSize: '1.1rem'
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        textAlign: 'center',
                                        py: 1
                                    }
                                }}
                                InputProps={{
                                    inputProps: { min: 1 }
                                }}
                            />

                            <IconButton
                                onClick={() => handleQuantityChange(orderData.quantity + 1)}
                                size="small"
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    borderRadius: '50%',
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <AddIcon />
                            </IconButton>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Địa chỉ giao hàng"
                            name="deliveryAddress"
                            value={orderData.deliveryAddress}
                            onChange={handleChange}
                            required
                            error={errors?.deliveryAddress}
                            helperText={errors?.deliveryAddress ? "Vui lòng nhập địa chỉ giao hàng" : ""}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 20px rgba(25,118,210,0.2)'
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LocationOnIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Số điện thoại"
                            name="phoneNumber"
                            value={orderData.phoneNumber}
                            onChange={handleChange}
                            required
                            error={errors?.phoneNumber}
                            helperText={errors?.phoneNumber ? "Vui lòng nhập số điện thoại hợp lệ (10-11 số)" : ""}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 20px rgba(25,118,210,0.2)'
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <PhoneIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Ghi chú (tùy chọn)"
                            name="notes"
                            value={orderData.notes}
                            onChange={handleChange}
                            multiline
                            rows={3}
                            placeholder="Ghi chú về đơn hàng..."
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 3,
                                    '&:hover': {
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    },
                                    '&.Mui-focused': {
                                        boxShadow: '0 4px 20px rgba(25,118,210,0.2)'
                                    }
                                }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                        <NoteIcon color="primary" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'primary.contrastText',
                            p: 3,
                            borderRadius: 3,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            boxShadow: '0 8px 25px rgba(25,118,210,0.3)'
                        }}>
                            <Typography variant="h6" fontWeight="600">
                                Tổng tiền:
                            </Typography>
                            <Typography variant="h4" fontWeight="bold">
                                {calculateTotal().toLocaleString('vi-VN')}đ
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3, gap: 2, bgcolor: 'grey.50' }}>
                <Button
                    onClick={onClose}
                    color="inherit"
                    variant="outlined"
                    size="large"
                    sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        borderColor: 'grey.300',
                        '&:hover': {
                            borderColor: 'grey.400',
                            bgcolor: 'grey.100',
                            transform: 'translateY(-1px)'
                        },
                        transition: 'all 0.2s ease'
                    }}
                >
                    Hủy
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                    size="large"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ShoppingCartIcon />}
                    sx={{
                        minWidth: 180,
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        boxShadow: '0 6px 20px rgba(25,118,210,0.4)',
                        '&:hover': {
                            boxShadow: '0 8px 25px rgba(25,118,210,0.5)',
                            transform: 'translateY(-2px)'
                        },
                        '&:disabled': {
                            bgcolor: 'grey.300',
                            boxShadow: 'none'
                        },
                        transition: 'all 0.3s ease'
                    }}
                >
                    {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default OrderModal;