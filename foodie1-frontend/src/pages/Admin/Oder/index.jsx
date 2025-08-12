import React, { useEffect, useRef, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Select, MenuItem, Button, Typography, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Avatar, Chip,
    Box, Skeleton, Alert, Fade, Grow, IconButton, Tooltip,
    Card, CardContent, useTheme, alpha, List, ListItem, ListItemAvatar,
    ListItemText, Divider, Grid
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
    Close as CloseIcon
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
            color: 'info'
        },
        {
            value: "DELIVERING",
            label: "Đang giao hàng",
            icon: <ShippingIcon sx={{ fontSize: 16 }} />,
            color: 'primary'
        },
        {
            value: "DELIVERED",
            label: "Đã giao hàng",
            icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
            color: 'success'
        },
        {
            value: "CANCELLED",
            label: "Đã hủy",
            icon: <CancelIcon sx={{ fontSize: 16 }} />,
            color: 'error'
        },
    ];

    const PAYMENT_STATUSES = [
        {
            value: "PAID",
            label: "Đã thanh toán",
            icon: <PaymentIcon sx={{ fontSize: 16 }} />,
            color: 'success'
        },
        {
            value: "NOT_PAID",
            label: "Chưa thanh toán",
            icon: <MoneyOffIcon sx={{ fontSize: 16 }} />,
            color: 'warning'
        }
    ];

    const getStatusInfo = (status) => {
        return ORDER_STATUSES.find(s => s.value === status) ||
            { value: status, label: status, icon: <ScheduleIcon />, color: 'default' };
    };

    const getPaymentInfo = (status) => {
        return PAYMENT_STATUSES.find(s => s.value === status) ||
            { value: status, label: status, icon: <MoneyOffIcon />, color: 'default' };
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
        <TableContainer component={Paper} elevation={2}>
            <Table>
                <TableHead>
                    <TableRow>
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
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            {[...Array(9)].map((_, cellIndex) => (
                                <TableCell key={cellIndex}>
                                    <Skeleton variant="text" width="100%" height={24} />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );

    const EmptyState = () => (
        <Card elevation={2} sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
                <ShoppingCartIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    Chưa có đơn hàng nào
                </Typography>
                <Typography variant="body2" color="text.disabled">
                    Các đơn hàng sẽ hiển thị ở đây khi khách hàng đặt hàng
                </Typography>
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="h4" fontWeight="bold" color="primary">
                            Quản lý đơn hàng
                        </Typography>
                        <Box display="flex" gap={2} alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                                Tự động cập nhật mỗi 5 giây
                            </Typography>
                            <Tooltip title="Làm mới">
                                <IconButton onClick={fetchOrders} color="primary">
                                    <RefreshIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    {orders.length > 0 && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            Tổng cộng {orders.length} đơn hàng
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {loading ? (
                <LoadingSkeleton />
            ) : orders.length === 0 ? (
                <EmptyState />
            ) : (
                <Fade in timeout={500}>
                    <TableContainer component={Paper} elevation={2}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Người đặt</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Thời gian</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Món ăn</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Ảnh</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái đơn hàng</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái thanh toán</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>Hành động</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {orders.map((order, index) => (
                                    <Grow in timeout={500 + index * 100} key={order.id}>
                                        <TableRow
                                            hover
                                            sx={{
                                                '&:hover': {
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                                                },
                                                transition: 'background-color 0.2s ease'
                                            }}
                                        >
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    #{order.id}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                        {(order.userName || 'A')[0].toUpperCase()}
                                                    </Avatar>
                                                    <Typography variant="body2">
                                                        {order.userName || 'Ẩn danh'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" color="text.secondary">
                                                    {formatDate(order.orderTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ maxWidth: 200 }}>
                                                    {order.foodName ? (
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {order.foodName}
                                                        </Typography>
                                                    ) : (
                                                        <Box>
                                                            {order.items?.slice(0, 2).map((item, idx) => (
                                                                <Typography
                                                                    key={idx}
                                                                    variant="body2"
                                                                    sx={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        mb: 0.5
                                                                    }}
                                                                >
                                                                    <span>{item.foodName}</span>
                                                                    <Chip
                                                                        label={`x${item.quantity}`}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        sx={{ ml: 1 }}
                                                                    />
                                                                </Typography>
                                                            ))}
                                                            {order.items && order.items.length > 2 && (
                                                                <Button
                                                                    size="small"
                                                                    variant="text"
                                                                    startIcon={<VisibilityIcon />}
                                                                    onClick={() => handleOrderClick(order)}
                                                                    sx={{ mt: 1, fontSize: '0.75rem' }}
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
                                                                    sx={{ mt: 1, fontSize: '0.75rem' }}
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
                                                        sx={{ width: 50, height: 50 }}
                                                    />
                                                ) : order.items?.length > 0 ? (
                                                    <Avatar
                                                        variant="rounded"
                                                        src={order.items[0].imageUrl}
                                                        sx={{ width: 50, height: 50 }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.disabled">
                                                        Không có
                                                    </Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                                    {order.totalAmount?.toLocaleString()}₫
                                                </Typography>
                                            </TableCell>

                                            {/* Trạng thái đơn hàng */}
                                            <TableCell>
                                                <Box display="flex" flexDirection="column" gap={1}>
                                                    <Chip
                                                        icon={getStatusInfo(order.status).icon}
                                                        label={getStatusInfo(order.status).label}
                                                        color={getStatusInfo(order.status).color}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                    <Select
                                                        value={order.status}
                                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                        size="small"
                                                        disabled={updating[`order_${order.id}`]}
                                                        sx={{ minWidth: 140 }}
                                                    >
                                                        {ORDER_STATUSES.map((status) => (
                                                            <MenuItem key={status.value} value={status.value}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    {status.icon}
                                                                    {status.label}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {updating[`order_${order.id}`] && (
                                                        <Box display="flex" justifyContent="center">
                                                            <CircularProgress size={16} />
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>

                                            {/* Trạng thái thanh toán */}
                                            <TableCell>
                                                <Box display="flex" flexDirection="column" gap={1}>
                                                    <Chip
                                                        icon={getPaymentInfo(order.paymentStatus).icon}
                                                        label={getPaymentInfo(order.paymentStatus).label}
                                                        color={getPaymentInfo(order.paymentStatus).color}
                                                        size="small"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                    <Select
                                                        value={order.paymentStatus}
                                                        onChange={(e) => handleStatusPaymentStatusChange(order.id, e.target.value)}
                                                        size="small"
                                                        disabled={updating[`payment_${order.id}`]}
                                                        sx={{ minWidth: 140 }}
                                                    >
                                                        {PAYMENT_STATUSES.map((status) => (
                                                            <MenuItem key={status.value} value={status.value}>
                                                                <Box display="flex" alignItems="center" gap={1}>
                                                                    {status.icon}
                                                                    {status.label}
                                                                </Box>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                    {updating[`payment_${order.id}`] && (
                                                        <Box display="flex" justifyContent="center">
                                                            <CircularProgress size={16} />
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
                                                            '&:hover': {
                                                                backgroundColor: alpha(theme.palette.error.main, 0.1)
                                                            }
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
                </Fade>
            )}

            {/* Enhanced Confirm Dialog */}
            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, orderId: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    elevation: 8,
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)'
                    }
                }}
            >
                <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
                    <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                        <Avatar sx={{ bgcolor: 'error.main' }}>
                            <DeleteIcon />
                        </Avatar>
                        <Typography variant="h6" fontWeight="bold">
                            Xác nhận xóa đơn hàng
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body1" color="text.secondary">
                        Bạn có chắc chắn muốn xóa đơn hàng <strong>#{confirmDialog.orderId}</strong> không?
                    </Typography>
                    <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                        Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 3 }}>
                    <Button
                        onClick={() => setConfirmDialog({ open: false, orderId: null })}
                        variant="outlined"
                        size="large"
                        sx={{ minWidth: 100 }}
                    >
                        Hủy
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        size="large"
                        sx={{ minWidth: 100 }}
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
                    elevation: 8,
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                        maxHeight: '80vh'
                    }
                }}
            >
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={2}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                <ShoppingCartIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Chi tiết đơn hàng #{orderDetailDialog.order?.id}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {orderDetailDialog.order?.userName || 'Ẩn danh'} • {orderDetailDialog.order?.orderTime && formatDate(orderDetailDialog.order.orderTime)}
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton onClick={() => setOrderDetailDialog({ open: false, order: null })}>
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
                                                sx={{ width: 60, height: 60, mr: 1 }}
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
                                                    <Typography variant="h6" color="success.main" fontWeight="bold">
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
                                                                    color="primary"
                                                                    variant="outlined"
                                                                />
                                                            </Box>
                                                        </Grid>
                                                        <Grid item xs={6}>
                                                            <Box display="flex" alignItems="center" gap={1}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Thành tiền:
                                                                </Typography>
                                                                <Typography variant="body2" fontWeight="bold" color="success.main">
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
                    <Box sx={{ p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
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
                                <Typography variant="h5" fontWeight="bold" color="success.main">
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
                                    color={getStatusInfo(orderDetailDialog.order?.status).color}
                                    size="small"
                                    sx={{ fontWeight: 600, mt: 0.5 }}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="body2" color="text.secondary">
                                    Thanh toán:
                                </Typography>
                                <Chip
                                    icon={getPaymentInfo(orderDetailDialog.order?.paymentStatus).icon}
                                    label={getPaymentInfo(orderDetailDialog.order?.paymentStatus).label}
                                    color={getPaymentInfo(orderDetailDialog.order?.paymentStatus).color}
                                    size="small"
                                    sx={{ fontWeight: 600, mt: 0.5 }}
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
                    >
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default OrderManagement;