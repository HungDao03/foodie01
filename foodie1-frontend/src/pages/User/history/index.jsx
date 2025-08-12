import React, { useEffect, useState } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    Card,
    CardContent,
    Divider,
    Avatar,
    Badge,
    Skeleton,
    Fade,
    useTheme,
    alpha,
} from '@mui/material';
import {
    ShoppingBag,
    LocalShipping,
    CheckCircle,
    Cancel,
    Phone,
    LocationOn,
    StickyNote2,
    Payment,
    AccessTime,
} from '@mui/icons-material';
import OrderService from "../../../service/orderService.js";

function getStatusText(status) {
    switch (status) {
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'DELIVERING': return 'Đang giao hàng';
        case 'DELIVERED': return 'Đã giao hàng';
        case 'CANCELLED': return 'Đã hủy';
        default: return status;
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'CONFIRMED': return 'info';
        case 'DELIVERING': return 'primary';
        case 'DELIVERED': return 'success';
        case 'CANCELLED': return 'error';
        default: return 'default';
    }
}

function getStatusIcon(status) {
    switch (status) {
        case 'CONFIRMED': return <ShoppingBag fontSize="small" />;
        case 'DELIVERING': return <LocalShipping fontSize="small" />;
        case 'DELIVERED': return <CheckCircle fontSize="small" />;
        case 'CANCELLED': return <Cancel fontSize="small" />;
        default: return <ShoppingBag fontSize="small" />;
    }
}

function OrderSkeleton() {
    return (
        <Card sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Skeleton variant="text" width={120} height={32} />
                        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
                    </Box>
                    <Skeleton variant="text" width={100} height={24} />
                </Box>
                <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 2 }} />
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Skeleton variant="text" width="60%" height={20} />
                    <Skeleton variant="text" width="50%" height={20} />
                    <Skeleton variant="text" width="40%" height={20} />
                </Box>
            </CardContent>
        </Card>
    );
}

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const theme = useTheme();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const res = await OrderService.getUserOrders();
                setOrders(res.data);
            } catch (err) {
                setError('Không thể lấy lịch sử đơn hàng!');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError('')}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    severity="error"
                    sx={{
                        width: '100%',
                        borderRadius: 3,
                        fontWeight: 600,
                        boxShadow: theme.shadows[8]
                    }}
                >
                    {error}
                </Alert>
            </Snackbar>

            {/* Enhanced Header */}
            <Box sx={{ textAlign: 'center', mb: 5 }}>
                <Typography
                    variant="h3"
                    sx={{
                        mb: 2,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 4px 16px rgba(60,40,120,0.15)',
                        letterSpacing: '-0.02em'
                    }}
                >
                    Lịch sử đặt hàng
                </Typography>
                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: 500, mx: 'auto', lineHeight: 1.6 }}
                >
                    Theo dõi tất cả đơn hàng của bạn tại đây
                </Typography>
            </Box>

            {loading ? (
                <Box>
                    {[1, 2, 3].map((item) => (
                        <OrderSkeleton key={item} />
                    ))}
                </Box>
            ) : orders.length === 0 ? (
                <Fade in={true}>
                    <Card sx={{
                        textAlign: 'center',
                        py: 8,
                        borderRadius: 4,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                    }}>
                        <CardContent>
                            <Avatar sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main'
                            }}>
                                <ShoppingBag sx={{ fontSize: 40 }} />
                            </Avatar>
                            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                                Chưa có đơn hàng nào
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Hãy khám phá và đặt món ăn yêu thích của bạn
                            </Typography>
                        </CardContent>
                    </Card>
                </Fade>
            ) : (
                <Box>
                    {orders.map((order, index) => (
                        <Fade in={true} timeout={300 + index * 100} key={order.id}>
                            <Card sx={{
                                mb: 3,
                                borderRadius: 4,
                                overflow: 'hidden',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                                    transform: 'translateY(-2px)'
                                }
                            }}>
                                <CardContent sx={{ p: 0 }}>
                                    {/* Enhanced Order Header */}
                                    <Box sx={{
                                        p: 3,
                                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.03)} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                    Đơn hàng #{order.id}
                                                </Typography>
                                                <Chip
                                                    icon={getStatusIcon(order.status)}
                                                    label={getStatusText(order.status)}
                                                    color={getStatusColor(order.status)}
                                                    sx={{
                                                        fontWeight: 600,
                                                        height: 32,
                                                        '& .MuiChip-icon': { fontSize: 16 }
                                                    }}
                                                />
                                                {order.items && order.items.length > 1 && (
                                                    <Badge badgeContent={order.items.length} color="secondary">
                                                        <Chip
                                                            label="Ghép đơn"
                                                            color="secondary"
                                                            variant="outlined"
                                                            size="small"
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </Badge>
                                                )}
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                    {order.totalAmount?.toLocaleString('vi-VN')}đ
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Tổng thanh toán
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    {/* Enhanced Items Table */}
                                    <Box sx={{ p: 3 }}>
                                        <TableContainer sx={{
                                            borderRadius: 3,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            overflow: 'hidden'
                                        }}>
                                            <Table sx={{ '& .MuiTableCell-root': { borderColor: alpha(theme.palette.divider, 0.05) } }}>
                                                <TableHead>
                                                    <TableRow sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                                                        '& .MuiTableCell-head': {
                                                            fontWeight: 700,
                                                            color: 'text.primary',
                                                            fontSize: '0.875rem'
                                                        }
                                                    }}>
                                                        <TableCell>Món ăn</TableCell>
                                                        <TableCell align="center">Số lượng</TableCell>
                                                        <TableCell align="right">Đơn giá</TableCell>
                                                        <TableCell align="right">Tổng tiền</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {order.items && order.items.length > 0 ? (
                                                        order.items.map((item, index) => (
                                                            <TableRow
                                                                key={index}
                                                                hover
                                                                sx={{
                                                                    '&:hover': {
                                                                        bgcolor: alpha(theme.palette.primary.main, 0.02)
                                                                    },
                                                                    transition: 'background-color 0.2s ease'
                                                                }}
                                                            >
                                                                <TableCell>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                        <Avatar
                                                                            src={item.imageUrl || '/default-image.jpg'}
                                                                            alt={item.foodName}
                                                                            sx={{
                                                                                width: 50,
                                                                                height: 50,
                                                                                borderRadius: 2,
                                                                                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                                                            }}
                                                                        />
                                                                        <Typography sx={{ fontWeight: 500 }}>
                                                                            {item.foodName}
                                                                        </Typography>
                                                                    </Box>
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={item.quantity}
                                                                        size="small"
                                                                        sx={{
                                                                            fontWeight: 700,
                                                                            bgcolor: 'primary.main',
                                                                            color: 'white',
                                                                            minWidth: 40
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                                    {item.price.toLocaleString('vi-VN')}đ
                                                                </TableCell>
                                                                <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow hover>
                                                            <TableCell>
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                                    <Avatar
                                                                        src={order.imageUrl || '/default-image.jpg'}
                                                                        alt={order.foodName || 'Sản phẩm'}
                                                                        sx={{
                                                                            width: 50,
                                                                            height: 50,
                                                                            borderRadius: 2,
                                                                            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
                                                                        }}
                                                                    />
                                                                    <Typography sx={{ fontWeight: 500 }}>
                                                                        {order.foodName || 'N/A'}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                <Chip
                                                                    label={order.quantity || 1}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 700,
                                                                        bgcolor: 'primary.main',
                                                                        color: 'white',
                                                                        minWidth: 40
                                                                    }}
                                                                />
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                                {(order.discountPrice || order.price || 0).toLocaleString('vi-VN')}đ
                                                            </TableCell>
                                                            <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                                                {(order.totalAmount || (order.discountPrice || order.price) * (order.quantity || 1)).toLocaleString('vi-VN')}đ
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </Box>

                                    <Divider />

                                    {/* Enhanced Order Details */}
                                    <Box sx={{ p: 3 }}>
                                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                                            Chi tiết đơn hàng
                                        </Typography>
                                        <Box sx={{
                                            display: 'grid',
                                            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                                            gap: 2
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <AccessTime sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                        Thời gian đặt hàng
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {order.orderTime ? new Date(order.orderTime).toLocaleString('vi-VN') : 'N/A'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Phone sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                        Số điện thoại
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {order.phoneNumber}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                                <LocationOn sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                        Địa chỉ giao hàng
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                                        {order.deliveryAddress}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Payment sx={{ color: 'text.secondary', fontSize: 20 }} />
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                        Thanh toán
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                        {order.paymentMethod} | {order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            {order.notes && (
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, gridColumn: { xs: '1', md: '1 / -1' } }}>
                                                    <StickyNote2 sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2 }} />
                                                    <Box>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                                                            Ghi chú
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.4 }}>
                                                            {order.notes}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Fade>
                    ))}
                </Box>
            )}
        </Container>
    );
}