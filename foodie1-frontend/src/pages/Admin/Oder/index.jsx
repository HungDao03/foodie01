import React, { useEffect, useRef, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Select, MenuItem, Button, Typography, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Avatar, Chip,
    Box, Skeleton, Alert, Fade, Grow, IconButton, Tooltip,
    Card, CardContent, useTheme, alpha, List, ListItem, ListItemAvatar,
    ListItemText, Divider, Grid, LinearProgress, Badge
} from '@mui/material';
import {
    Delete as DeleteIcon,
    CheckCircle as CheckCircleIcon,
    LocalShipping as ShippingIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    Payment as PaymentIcon,
    MoneyOff as MoneyOffIcon,
    Refresh as RefreshIcon,
    ShoppingCart as ShoppingCartIcon,
    Visibility as VisibilityIcon,
    Close as CloseIcon,
    TrendingUp as TrendingUpIcon,
    Analytics as AnalyticsIcon,
    Timer as TimerIcon
} from '@mui/icons-material';
import AdminService from "../../../service/adminservice.js";
import useOrderStore from "../../../components/store/useOrderStore.jsx";
import orderService from "../../../service/orderService.js";

const OrderManagement = () => {
    const theme = useTheme();
    const [orders, setOrders] = useState([]);
    const { setOrders: updateOrdersFromStore } = useOrderStore();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState({});
    const [confirmDialog, setConfirmDialog] = useState({ open: false, orderId: null });
    const [orderDetailDialog, setOrderDetailDialog] = useState({ open: false, order: null });

    const ORDER_STATUSES = [
        {
            value: "CONFIRMED",
            label: "Đã xác nhận",
            icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
            color: 'info',
            gradient: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)'
        },
        {
            value: "DELIVERED",
            label: "Đã giao hàng",
            icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
            color: 'success',
            gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)'
        },
        {
            value: "CANCELLED",
            label: "Đã hủy",
            icon: <CancelIcon sx={{ fontSize: 16 }} />,
            color: 'error',
            gradient: 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)'
        },
    ];

    const PAYMENT_STATUSES = [
        {
            value: "PAID",
            label: "Đã thanh toán",
            icon: <PaymentIcon sx={{ fontSize: 16 }} />,
            color: 'success',
            gradient: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)'
        },
        {
            value: "NOT_PAID",
            label: "Chưa thanh toán",
            icon: <MoneyOffIcon sx={{ fontSize: 16 }} />,
            color: 'warning',
            gradient: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)'
        }
    ];

    const getStatusInfo = (status) => {
        return ORDER_STATUSES.find(s => s.value === status) ||
            { value: status, label: status, icon: <ScheduleIcon />, color: 'default', gradient: 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)' };
    };

    const getPaymentInfo = (status) => {
        return PAYMENT_STATUSES.find(s => s.value === status) ||
            { value: status, label: status, icon: <MoneyOffIcon />, color: 'default', gradient: 'linear-gradient(135deg, #9E9E9E 0%, #BDBDBD 100%)' };
    };

    const handleStatusChange = async (id, newStatus) => {
        setUpdating(prev => ({ ...prev, [`order_${id}`]: true }));
        try {
            await orderService.updateOrderStatus(id, newStatus);
            const res = await orderService.getAllOrders();
            setOrders(res.data);
            updateOrdersFromStore(res.data);
            ordersRef.current = res.data;
        } catch (err) {
            console.error("Lỗi cập nhật trạng thái đơn hàng:", err);
        } finally {
            setUpdating(prev => ({ ...prev, [`order_${id}`]: false }));
        }
    };

    const handleStatusPaymentStatusChange = async (id, newStatus) => {
        setUpdating(prev => ({ ...prev, [`payment_${id}`]: true }));
        try {
            await AdminService.updateOrderStatus(id, newStatus);
            const res = await AdminService.getAllOrders();
            setOrders(res.data);
            updateOrdersFromStore(res.data);
            ordersRef.current = res.data;
        } catch (err) {
            console.error('Lỗi cập nhật trạng thái:', err);
        } finally {
            setUpdating(prev => ({ ...prev, [`payment_${id}`]: false }));
        }
    };

    const handleDelete = async () => {
        try {
            await AdminService.deleteOrder(confirmDialog.orderId);
            setConfirmDialog({ open: false, orderId: null });
            fetchOrders();
        } catch (err) {
            console.error('Lỗi xóa đơn hàng:', err);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await AdminService.getAllOrders();
            setOrders(res.data);
            updateOrdersFromStore(res.data);
            ordersRef.current = res.data;
        } catch (err) {
            console.error('Lỗi khi lấy đơn hàng:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderClick = (order) => {
        if (order.items && order.items.length > 1) {
            setOrderDetailDialog({ open: true, order });
        }
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleString("vi-VN", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ordersRef = useRef([]);

    useEffect(() => {
        const fetchAndCompare = async () => {
            try {
                const res = await AdminService.getAllOrders();
                const newOrders = res.data;

                const newIds = newOrders.map(order => order.id).sort();
                const oldIds = ordersRef.current.map(order => order.id).sort();

                const isDifferent = newIds.length !== oldIds.length ||
                    !newIds.every((id, index) => id === oldIds[index]);

                if (isDifferent) {
                    setOrders(newOrders);
                    ordersRef.current = newOrders;
                }

                setLoading(false);
            } catch (err) {
                console.error('Lỗi khi lấy đơn hàng:', err);
                setLoading(false);
            }
        };

        fetchAndCompare();
        const interval = setInterval(fetchAndCompare, 5000);
        return () => clearInterval(interval);
    }, []);

    const LoadingSkeleton = () => (
        <Card elevation={0} sx={{ 
            background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            borderRadius: 4,
            overflow: 'hidden'
        }}>
            <Box sx={{ p: 3, background: 'rgba(255,255,255,0.1)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Skeleton variant="text" width={200} height={32} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={400} sx={{ borderRadius: 2 }} />
            </Box>
        </Card>
    );

    const EmptyState = () => (
        <Card elevation={0} sx={{ 
            textAlign: 'center', 
            py: 8,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            borderRadius: 4,
            position: 'relative',
            overflow: 'hidden'
        }}>
                                                                    <Box sx={{
                                                            position: 'absolute',
                                                            top: -50,
                                                            right: -50,
                                                            width: 100,
                                                            height: 100,
                                                            borderRadius: '50%',
                                                            background: theme.palette.mode === 'dark' 
                                                                ? 'rgba(118, 75, 162, 0.2)' 
                                                                : 'rgba(255,255,255,0.1)',
                                                            animation: 'pulse 2s infinite'
                                                        }} />
                                                        <Box sx={{
                                                            position: 'absolute',
                                                            bottom: -30,
                                                            left: -30,
                                                            width: 80,
                                                            height: 80,
                                                            borderRadius: '50%',
                                                            background: theme.palette.mode === 'dark' 
                                                                ? 'rgba(118, 75, 162, 0.2)' 
                                                                : 'rgba(255,255,255,0.1)',
                                                            animation: 'pulse 2s infinite 1s'
                                                        }} />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <ShoppingCartIcon sx={{ 
                    fontSize: 80, 
                    color: 'rgba(255,255,255,0.8)', 
                    mb: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                }} />
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                    Chưa có đơn hàng nào
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Các đơn hàng sẽ hiển thị ở đây khi khách hàng đặt hàng
                </Typography>
            </CardContent>
        </Card>
    );

    const StatCard = ({ icon, title, value, color, gradient }) => (
        <Card elevation={0} sx={{
            background: gradient || `linear-gradient(135deg, ${color}20 0%, ${color}10 100%)`,
            borderRadius: 3,
            border: `1px solid ${color}30`,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 8px 25px ${color}40`,
                border: `1px solid ${color}50`
            }
        }}>
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background: gradient || `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {icon}
                    </Box>
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {title}
                        </Typography>
                        <Typography variant="h6" fontWeight="bold" color={color}>
                            {value}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ 
            p: 3, 
            background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh'
        }}>
            {/* Header Section */}
            <Card elevation={0} sx={{ 
                mb: 3, 
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative'
            }}>
                <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '100%',
                    height: '100%',
                    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.3
                }} />
                <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ 
                                color: 'white', 
                                mb: 1,
                                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                            }}>
                            Quản lý đơn hàng
                        </Typography>
                            <Typography variant="h6" sx={{ 
                                color: 'rgba(255,255,255,0.9)',
                                fontWeight: 300
                            }}>
                                Theo dõi và quản lý tất cả đơn hàng trong hệ thống
                            </Typography>
                        </Box>
                        <Box display="flex" gap={2} alignItems="center">
                            <Box sx={{
                                p: 2,
                                borderRadius: 3,
                                background: theme.palette.mode === 'dark' 
                                    ? 'rgba(118, 75, 162, 0.1)' 
                                    : 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                border: theme.palette.mode === 'dark' 
                                    ? '1px solid rgba(118, 75, 162, 0.2)' 
                                    : '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <TimerIcon sx={{ color: 'rgba(255,255,255,0.8)' }} />
                                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                                Tự động cập nhật mỗi 5 giây
                            </Typography>
                                </Box>
                            </Box>
                            <Tooltip title="Làm mới">
                                <IconButton 
                                    onClick={fetchOrders} 
                                    sx={{ 
                                        background: theme.palette.mode === 'dark' 
                                            ? 'rgba(118, 75, 162, 0.3)' 
                                            : 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        '&:hover': {
                                            background: theme.palette.mode === 'dark' 
                                                ? 'rgba(118, 75, 162, 0.5)' 
                                                : 'rgba(255,255,255,0.3)',
                                            transform: 'rotate(180deg)'
                                        },
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>
                </CardContent>
            </Card>

            {/* Stats Cards */}
                    {orders.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, mb: 3 }}>
                    <StatCard
                        icon={<ShoppingCartIcon />}
                        title="Tổng đơn hàng"
                        value={orders.length}
                                                                    color={theme.palette.primary.main}
                    />
                    <StatCard
                        icon={<TrendingUpIcon />}
                        title="Đơn đã xác nhận"
                        value={orders.filter(o => o.status === 'CONFIRMED').length}
                        color="#4CAF50"
                    />
                    <StatCard
                        icon={<PaymentIcon />}
                        title="Đã thanh toán"
                        value={orders.filter(o => o.paymentStatus === 'PAID').length}
                        color="#FF9800"
                    />
                    <StatCard
                        icon={<AnalyticsIcon />}
                        title="Tổng doanh thu"
                        value={`${orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0).toLocaleString()}₫`}
                        color="#9C27B0"
                    />
                </Box>
            )}

            {/* Main Content */}
            {loading ? (
                <LoadingSkeleton />
            ) : orders.length === 0 ? (
                <EmptyState />
            ) : (
                <Fade in timeout={500}>
                    <Card elevation={0} sx={{
                        background: theme.palette.mode === 'dark' 
                            ? 'rgba(45,45,45,0.9)' 
                            : 'rgba(255,255,255,0.9)',
                        borderRadius: 4,
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                        border: theme.palette.mode === 'dark' 
                            ? '1px solid rgba(118, 75, 162, 0.2)' 
                            : '1px solid rgba(255,255,255,0.2)'
                    }}>
                        <TableContainer>
                        <Table>
                            <TableHead>
                                    <TableRow sx={{ 
                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                        '& th': {
                                            color: 'white',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px'
                                        }
                                    }}>
                                        <TableCell>ID</TableCell>
                                        <TableCell>Người đặt</TableCell>
                                        <TableCell>Thời gian</TableCell>
                                        <TableCell>Món ăn</TableCell>
                                        <TableCell>Ảnh</TableCell>
                                        <TableCell>Tổng tiền</TableCell>
                                        <TableCell>Trạng thái đơn hàng</TableCell>
                                        <TableCell>Trạng thái thanh toán</TableCell>
                                        <TableCell>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order, index) => (
                                    <Grow in timeout={500 + index * 100} key={order.id}>
                                        <TableRow
                                            hover
                                            sx={{
                                                '&:hover': {
                                                        background: theme.palette.mode === 'dark' 
                                                            ? 'linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)'
                                                            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                                                        transform: 'scale(1.01)',
                                                        transition: 'all 0.3s ease'
                                                },
                                                    transition: 'all 0.3s ease',
                                                    '&:nth-of-type(even)': {
                                                        background: theme.palette.mode === 'dark' 
                                                            ? 'rgba(118, 75, 162, 0.05)' 
                                                            : 'rgba(102, 126, 234, 0.02)'
                                                    }
                                            }}
                                        >
                                            <TableCell>
                                                    <Chip
                                                        label={`#${order.id}`}
                                                        size="small"
                                                        sx={{
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                            color: 'white',
                                                            fontWeight: 600,
                                                            boxShadow: `0 2px 8px ${theme.palette.primary.main}30`
                                                        }}
                                                    />
                                            </TableCell>
                                            <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                        <Avatar sx={{ 
                                                            width: 40, 
                                                            height: 40, 
                                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                            boxShadow: `0 2px 8px ${theme.palette.primary.main}30`
                                                        }}>
                                                        {(order.userName || 'A')[0].toUpperCase()}
                                                    </Avatar>
                                                        <Typography variant="body2" fontWeight={500}>
                                                        {order.userName || 'Ẩn danh'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                    <Box sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        background: `${theme.palette.primary.main}10`,
                                                        border: `1px solid ${theme.palette.primary.main}20`
                                                    }}>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                    {formatDate(order.orderTime)}
                                                </Typography>
                                                    </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ maxWidth: 200 }}>
                                                    {order.foodName ? (
                                                            <Typography variant="body2" fontWeight={500} sx={{
                                                                p: 1,
                                                                borderRadius: 2,
                                                                background: 'rgba(76, 175, 80, 0.1)',
                                                                border: '1px solid rgba(76, 175, 80, 0.2)'
                                                            }}>
                                                            {order.foodName}
                                                        </Typography>
                                                    ) : (
                                                        <Box>
                                                            {order.items?.slice(0, 2).map((item, idx) => (
                                                                    <Box
                                                                    key={idx}
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                            mb: 0.5,
                                                                            alignItems: 'center',
                                                                            p: 0.5,
                                                                            borderRadius: 1.5,
                                                                            background: 'rgba(76, 175, 80, 0.05)',
                                                                            border: '1px solid rgba(76, 175, 80, 0.1)'
                                                                        }}
                                                                    >
                                                                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                                            {item.foodName}
                                                                        </Typography>
                                                                    <Chip
                                                                        label={`x${item.quantity}`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                            sx={{ 
                                                                                ml: 1,
                                                                                borderColor: 'rgba(76, 175, 80, 0.3)',
                                                                                color: 'rgba(76, 175, 80, 0.8)'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                            ))}
                                                            {order.items && order.items.length > 2 && (
                                                                <Button
                                                                    size="small"
                                                                    variant="text"
                                                                    startIcon={<VisibilityIcon />}
                                                                    onClick={() => handleOrderClick(order)}
                                                                        sx={{ 
                                                                            mt: 1, 
                                                                            fontSize: '0.75rem',
                                                                            color: theme.palette.primary.main,
                                                                            '&:hover': {
                                                                                background: `${theme.palette.primary.main}10`
                                                                            }
                                                                        }}
                                                                >
                                                                    Xem thêm {order.items.length - 2} món
                                                                </Button>
                                                            )}
                                                            {order.items && order.items.length > 1 && order.items.length <= 2 && (
                                                                <Button
                                                                    size="small"
                                                                    variant="text"
                                                                    startIcon={<VisibilityIcon />}
                                                                    onClick={() => handleOrderClick(order)}
                                                                        sx={{ 
                                                                            mt: 1, 
                                                                            fontSize: '0.75rem',
                                                                            color: theme.palette.primary.main,
                                                                            '&:hover': {
                                                                                background: `${theme.palette.primary.main}10`
                                                                            }
                                                                        }}
                                                                >
                                                                    Xem chi tiết
                                                                </Button>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                {order.imageUrl ? (
                                                    <Avatar
                                                        variant="rounded"
                                                        src={order.imageUrl}
                                                            sx={{ 
                                                                width: 50, 
                                                                height: 50,
                                                                border: `2px solid ${theme.palette.primary.main}20`,
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                            }}
                                                    />
                                                ) : order.items?.length > 0 ? (
                                                    <Avatar
                                                        variant="rounded"
                                                        src={order.items[0].imageUrl}
                                                            sx={{ 
                                                                width: 50, 
                                                                height: 50,
                                                                border: `2px solid ${theme.palette.primary.main}20`,
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                            }}
                                                    />
                                                ) : (
                                                        <Box sx={{
                                                            width: 50,
                                                            height: 50,
                                                            borderRadius: 2,
                                                            background: 'rgba(158, 158, 158, 0.1)',
                                                            border: '2px dashed rgba(158, 158, 158, 0.3)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'text.disabled'
                                                        }}>
                                                            🍽️
                                                        </Box>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                                                        backgroundClip: 'text',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent',
                                                        textShadow: '0 2px 4px rgba(76, 175, 80, 0.2)'
                                                    }}>
                                                    {order.totalAmount?.toLocaleString()}₫
                                                </Typography>
                                            </TableCell>

                                            {/* Trạng thái đơn hàng */}
                                            <TableCell>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: 1.5,
                                                    alignItems: 'center'
                                                }}>
                                                    {/* Status Display */}
                                                    <Box sx={{
                                                        position: 'relative',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1.5,
                                                        borderRadius: 3,
                                                        background: getStatusInfo(order.status).gradient,
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                                        minWidth: 120,
                                                        justifyContent: 'center',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                                                        }
                                                    }}>
                                                        {getStatusInfo(order.status).icon}
                                                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                            {getStatusInfo(order.status).label}
                                                        </Typography>
                                                    </Box>

                                                    {/* Status Selector */}
                                                    <Box sx={{
                                                        position: 'relative',
                                                        width: '100%'
                                                    }}>
                                                    <Select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        size="small"
                                                        disabled={updating[`order_${order.id}`]}
                                                            sx={{
                                                                width: '100%',
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2.5,
                                                                    background: 'rgba(255,255,255,0.9)',
                                                                    border: `2px solid ${getStatusInfo(order.status).color}30`,
                                                                    '&:hover': {
                                                                        borderColor: getStatusInfo(order.status).color,
                                                                        background: 'rgba(255,255,255,1)',
                                                                        transform: 'translateY(-1px)',
                                                                        boxShadow: `0 4px 12px ${getStatusInfo(order.status).color}30`
                                                                    },
                                                                    '&.Mui-focused': {
                                                                        borderColor: getStatusInfo(order.status).color,
                                                                        boxShadow: `0 0 0 3px ${getStatusInfo(order.status).color}20`
                                                                    }
                                                                },
                                                                '& .MuiSelect-icon': {
                                                                    color: getStatusInfo(order.status).color
                                                                }
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    sx: {
                                                                        borderRadius: 2.5,
                                                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                                                        border: '1px solid rgba(0,0,0,0.1)'
                                                                    }
                                                                }
                                                            }}
                                                    >
                                                        {ORDER_STATUSES.map((status) => (
                                                                <MenuItem key={status.value} value={status.value} sx={{
                                                                    borderRadius: 1.5,
                                                                    mx: 1,
                                                                    my: 0.5,
                                                                    '&:hover': {
                                                                        background: `${status.color}10`
                                                                    },
                                                                    '&.Mui-selected': {
                                                                        background: `${status.color}20`,
                                                                        color: status.color
                                                                    }
                                                                }}>
                                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                                        <Box sx={{
                                                                            p: 0.5,
                                                                            borderRadius: 1,
                                                                            background: `${status.color}20`,
                                                                            color: status.color,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                    {status.icon}
                                                                        </Box>
                                                                        <Typography variant="body2" fontWeight={500}>
                                                                    {status.label}
                                                                        </Typography>
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    </Box>

                                                    {/* Loading Indicator */}
                                                    {updating[`order_${order.id}`] && (
                                                        <Box sx={{ 
                                                            width: '100%',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            borderRadius: 2,
                                                            background: 'rgba(0,0,0,0.05)'
                                                        }}>
                                                            <LinearProgress 
                                                                sx={{ 
                                                                    height: 6, 
                                                                    borderRadius: 2,
                                                                    background: getStatusInfo(order.status).gradient,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        background: getStatusInfo(order.status).gradient
                                                                    }
                                                                }} 
                                                            />
                                                            <Typography variant="caption" sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                color: 'text.secondary',
                                                                fontWeight: 500,
                                                                fontSize: '0.7rem'
                                                            }}>
                                                                Đang cập nhật...
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            {/* Trạng thái thanh toán */}
                                            <TableCell>
                                                <Box sx={{ 
                                                    display: 'flex', 
                                                    flexDirection: 'column', 
                                                    gap: 1.5,
                                                    alignItems: 'center'
                                                }}>
                                                    {/* Payment Status Display */}
                                                    <Box sx={{
                                                        position: 'relative',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        p: 1.5,
                                                        borderRadius: 3,
                                                        background: getPaymentInfo(order.paymentStatus).gradient,
                                                        color: 'white',
                                                        fontWeight: 600,
                                                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                                                        minWidth: 120,
                                                        justifyContent: 'center',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-2px)',
                                                            boxShadow: '0 6px 20px rgba(0,0,0,0.3)'
                                                        }
                                                    }}>
                                                        {getPaymentInfo(order.paymentStatus).icon}
                                                        <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                                                            {getPaymentInfo(order.paymentStatus).label}
                                                        </Typography>
                                                    </Box>

                                                    {/* Payment Status Selector */}
                                                    <Box sx={{
                                                        position: 'relative',
                                                        width: '100%'
                                                    }}>
                                                    <Select
                                                        value={order.paymentStatus}
                                                        onChange={(e) => handleStatusPaymentStatusChange(order.id, e.target.value)}
                                                        size="small"
                                                        disabled={updating[`payment_${order.id}`]}
                                                            sx={{
                                                                width: '100%',
                                                                '& .MuiOutlinedInput-root': {
                                                                    borderRadius: 2.5,
                                                                    background: 'rgba(255,255,255,0.9)',
                                                                    border: `2px solid ${getPaymentInfo(order.paymentStatus).color}30`,
                                                                    '&:hover': {
                                                                        borderColor: getPaymentInfo(order.paymentStatus).color,
                                                                        background: 'rgba(255,255,255,1)',
                                                                        transform: 'translateY(-1px)',
                                                                        boxShadow: `0 4px 12px ${getPaymentInfo(order.paymentStatus).color}30`
                                                                    },
                                                                    '&.Mui-focused': {
                                                                        borderColor: getPaymentInfo(order.paymentStatus).color,
                                                                        boxShadow: `0 0 0 3px ${getPaymentInfo(order.paymentStatus).color}20`
                                                                    }
                                                                },
                                                                '& .MuiSelect-icon': {
                                                                    color: getPaymentInfo(order.paymentStatus).color
                                                                }
                                                            }}
                                                            MenuProps={{
                                                                PaperProps: {
                                                                    sx: {
                                                                        borderRadius: 2.5,
                                                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                                                        border: '1px solid rgba(0,0,0,0.1)'
                                                                    }
                                                                }
                                                            }}
                                                    >
                                                        {PAYMENT_STATUSES.map((status) => (
                                                                <MenuItem key={status.value} value={status.value} sx={{
                                                                    borderRadius: 1.5,
                                                                    mx: 1,
                                                                    my: 0.5,
                                                                    '&:hover': {
                                                                        background: `${status.color}10`
                                                                    },
                                                                    '&.Mui-selected': {
                                                                        background: `${status.color}20`,
                                                                        color: status.color
                                                                    }
                                                                }}>
                                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                                        <Box sx={{
                                                                            p: 0.5,
                                                                            borderRadius: 1,
                                                                            background: `${status.color}20`,
                                                                            color: status.color,
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            justifyContent: 'center'
                                                                        }}>
                                                                    {status.icon}
                                                                        </Box>
                                                                        <Typography variant="body2" fontWeight={500}>
                                                                    {status.label}
                                                                        </Typography>
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    </Box>

                                                    {/* Loading Indicator */}
                                                    {updating[`payment_${order.id}`] && (
                                                        <Box sx={{ 
                                                            width: '100%',
                                                            position: 'relative',
                                                            overflow: 'hidden',
                                                            borderRadius: 2,
                                                            background: 'rgba(0,0,0,0.05)'
                                                        }}>
                                                            <LinearProgress 
                                                                sx={{ 
                                                                    height: 6, 
                                                                    borderRadius: 2,
                                                                    background: getPaymentInfo(order.paymentStatus).gradient,
                                                                    '& .MuiLinearProgress-bar': {
                                                                        background: getPaymentInfo(order.paymentStatus).gradient
                                                                    }
                                                                }} 
                                                            />
                                                            <Typography variant="caption" sx={{
                                                                position: 'absolute',
                                                                top: '50%',
                                                                left: '50%',
                                                                transform: 'translate(-50%, -50%)',
                                                                color: 'text.secondary',
                                                                fontWeight: 500,
                                                                fontSize: '0.7rem'
                                                            }}>
                                                                Đang cập nhật...
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            <TableCell>
                                                <Tooltip title="Xóa đơn hàng">
                                                    <Button
                                                        variant="outlined"
                                                        color="error"
                                                        size="small"
                                                        startIcon={<DeleteIcon />}
                                                        onClick={() => setConfirmDialog({ open: true, orderId: order.id })}
                                                        sx={{
                                                                borderRadius: 2,
                                                                borderColor: 'rgba(244, 67, 54, 0.3)',
                                                                color: '#F44336',
                                                            '&:hover': {
                                                                    background: 'rgba(244, 67, 54, 0.1)',
                                                                    borderColor: '#F44336',
                                                                    transform: 'scale(1.05)'
                                                                },
                                                                transition: 'all 0.3s ease'
                                                        }}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    </Grow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    </Card>
                </Fade>
            )}

            {/* Enhanced Confirm Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, orderId: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: 4,
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, #1d1d1d 0%, #2d2d2d 100%)'
                            : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        border: `1px solid ${theme.palette.primary.main}20`,
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    textAlign: 'center', 
                    pb: 1,
                    background: 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)',
                    color: 'white'
                }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <Avatar sx={{ 
                            bgcolor: 'rgba(255,255,255,0.2)',
                            width: 60,
                            height: 60
                        }}>
                            <DeleteIcon sx={{ fontSize: 30 }} />
                        </Avatar>
                        <Typography variant="h5" fontWeight="bold">
                            Xác nhận xóa đơn hàng
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        Bạn có chắc chắn muốn xóa đơn hàng <strong>#{confirmDialog.orderId}</strong> không?
                    </Typography>
                    <Typography variant="body2" color="text.disabled">
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3, px: 3 }}>
                    <Button
                        onClick={() => setConfirmDialog({ open: false, orderId: null })}
                        variant="outlined"
                        size="large"
                        sx={{ 
                            minWidth: 100,
                            borderRadius: 2,
                            borderColor: `${theme.palette.primary.main}30`,
                            color: theme.palette.primary.main,
                            '&:hover': {
                                borderColor: theme.palette.primary.main,
                                background: `${theme.palette.primary.main}10`
                            }
                        }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        size="large"
                        sx={{ 
                            minWidth: 100,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #F44336 0%, #FF5722 100%)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #D32F2F 0%, #E64A19 100%)',
                                transform: 'scale(1.05)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Order Detail Dialog */}
            <Dialog
                open={orderDetailDialog.open}
                onClose={() => setOrderDetailDialog({ open: false, order: null })}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    elevation: 0,
                    sx: {
                        borderRadius: 4,
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, #1d1d1d 0%, #2d2d2d 100%)'
                            : 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        border: `1px solid ${theme.palette.primary.main}20`,
                        maxHeight: '80vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    pb: 1,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    color: 'white'
                }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ 
                                bgcolor: 'rgba(255,255,255,0.2)',
                                width: 50,
                                height: 50
                            }}>
                                <ShoppingCartIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h5" fontWeight="bold">
                                    Chi tiết đơn hàng #{orderDetailDialog.order?.id}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {orderDetailDialog.order?.userName || 'Ẩn danh'} • {orderDetailDialog.order?.orderTime && formatDate(orderDetailDialog.order.orderTime)}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton 
                            onClick={() => setOrderDetailDialog({ open: false, order: null })}
                            sx={{ color: 'rgba(255,255,255,0.8)' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ p: 0 }}>
                    {orderDetailDialog.order?.items && (
                        <List sx={{ pt: 0 }}>
                            {orderDetailDialog.order.items.map((item, index) => (
                                <Box key={index}>
                                    <ListItem sx={{ py: 2, px: 3 }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="rounded"
                                                src={item.imageUrl}
                                                sx={{ 
                                                    width: 60, 
                                                    height: 60, 
                                                    mr: 1,
                                                    border: `2px solid ${theme.palette.primary.main}20`,
                                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                                }}
                                            >
                                                {!item.imageUrl && <ShoppingCartIcon />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                                        {item.foodName}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{
                                                        fontWeight: 700,
                                                        background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                                                        backgroundClip: 'text',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent'
                                                    }}>
                                                        {item.price?.toLocaleString()}₫
                                                    </Typography>
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                                        <Grid item xs={6}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Số lượng:
                                                                </Typography>
                                                                <Chip
                                                                    label={`x${item.quantity}`}
                                                                    size="small"
                                                                    sx={{
                                                                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                                                        color: 'white',
                                                                        fontWeight: 600
                                                                    }}
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Thành tiền:
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight="bold" sx={{
                                                                    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                                                                    backgroundClip: 'text',
                                                                    WebkitBackgroundClip: 'text',
                                                                    WebkitTextFillColor: 'transparent'
                                                                }}>
                                                                    {(item.price * item.quantity)?.toLocaleString()}₫
                                                                </Typography>
                                                            </Box>
                                                        </Grid>
                                                    </Grid>
                                                    {item.description && (
                                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                                            {item.description}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                    {index < orderDetailDialog.order.items.length - 1 && (
                                        <Divider variant="inset" component="li" />
                                    )}
                                </Box>
                            ))}
                        </List>
                    )}

                    {/* Order Summary */}
                    <Box sx={{ 
                        p: 3, 
                        background: theme.palette.mode === 'dark' 
                            ? 'linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(102, 126, 234, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        borderTop: `1px solid ${theme.palette.primary.main}10`
                    }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            Tổng kết đơn hàng
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Tổng số món:
                                </Typography>
                                <Typography variant="body1" fontWeight="bold">
                                    {orderDetailDialog.order?.items?.reduce((sum, item) => sum + item.quantity, 0)} món
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Tổng tiền:
                                </Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{
                                    background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {orderDetailDialog.order?.totalAmount?.toLocaleString()}₫
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Trạng thái:
                                </Typography>
                                <Chip
                                    icon={getStatusInfo(orderDetailDialog.order?.status).icon}
                                    label={getStatusInfo(orderDetailDialog.order?.status).label}
                                    size="small"
                                    sx={{
                                        background: getStatusInfo(orderDetailDialog.order?.status).gradient,
                                        color: 'white',
                                        fontWeight: 600,
                                        mt: 0.5
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Thanh toán:
                                </Typography>
                                <Chip
                                    icon={getPaymentInfo(orderDetailDialog.order?.paymentStatus).icon}
                                    label={getPaymentInfo(orderDetailDialog.order?.paymentStatus).label}
                                    size="small"
                                    sx={{
                                        background: getPaymentInfo(orderDetailDialog.order?.paymentStatus).gradient,
                                        color: 'white',
                                        fontWeight: 600,
                                        mt: 0.5
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 3, pt: 2 }}>
                    <Button
                        onClick={() => setOrderDetailDialog({ open: false, order: null })}
                        variant="contained"
                        size="large"
                        fullWidth
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            borderRadius: 2,
                            '&:hover': {
                                background: theme.palette.mode === 'dark'
                                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                                    : `linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)`,
                                transform: 'scale(1.02)'
                            },
                            transition: 'all 0.3s ease'
                        }}
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 0.7; }
                }
            `}</style>
        </Box>
    );
};

export default OrderManagement;