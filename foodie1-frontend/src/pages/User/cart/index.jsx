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
  Button,
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  IconButton,
  Skeleton,
  Card,
  CardContent,
  Divider,
  Slide,
  Fade,
  CircularProgress,
  Backdrop,
  Stack,
  Tooltip,
  Badge
} from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmptyCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { toast } from 'react-toastify';
import CartService from '../../../service/cartService';
import { getCurrentUserId, isAuthenticated } from '../../../utils/authUtils';

// Transition components
const SlideTransition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * CartPage Component - Quản lý giỏ hàng của người dùng với UX/UI được cải thiện
 */
export default function CartPage() {
  // State quản lý dữ liệu giỏ hàng
  const [cart, setCart] = useState({ cartItems: [], totalAmount: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);
  const [updatingItems, setUpdatingItems] = useState(new Set());
  const [message, setMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [note, setNote] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  // Lấy userId của user hiện tại
  const userId = getCurrentUserId();

  // Load giỏ hàng khi component mount
  useEffect(() => {
    if (userId) {
      loadCart();
    }
  }, [userId]);

  // Reset selected items khi cart thay đổi
  useEffect(() => {
    setSelectedItems([]);
  }, [cart.cartItems]);

  /**
   * Tải dữ liệu giỏ hàng từ backend
   */
  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await CartService.getCart(userId);
      setCart(response.data);
      console.log('Cart Response Data:', response.data);
    } catch (error) {
      console.error('Error loading cart:', error);
      toast.error('Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cập nhật số lượng món ăn trong giỏ hàng
   */
  const handleUpdateQuantity = async (cartItemId, newQuantity) => {
    setUpdatingItems(prev => new Set(prev).add(cartItemId));
    try {
      await CartService.updateCartItemQuantity(userId, cartItemId, newQuantity);
      await loadCart();
      toast.success('Đã cập nhật số lượng!');
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(cartItemId);
        return newSet;
      });
    }
  };

  /**
   * Xác nhận đặt tất cả món ăn trong giỏ hàng
   */
  const handleConfirmOrderAll = async () => {
    setOrderLoading(true);
    try {
      await CartService.clearCart(userId);
      await loadCart();
      setOpenModal(false);
      toast.success('🎉 Đặt hàng thành công!');
      setNote('');
    } catch (error) {
      console.error('Error ordering all items:', error);
      toast.error('Không thể đặt hàng');
    } finally {
      setOrderLoading(false);
    }
  };

  const handleSelectItem = (cartItemId) => {
    setSelectedItems((prev) =>
        prev.includes(cartItemId)
            ? prev.filter((id) => id !== cartItemId)
            : [...prev, cartItemId]
    );
  };

  /**
   * Chọn/bỏ chọn tất cả món ăn
   */
  const handleSelectAll = () => {
    if (selectedItems.length === cart.cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.cartItems.map((item) => item.id));
    }
  };

  /**
   * Mở modal xác nhận đặt các món đã chọn
   */
  const handleOrderSelected = () => {
    if (selectedItems.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một món ăn!');
      return;
    }
    setOpenModal(true);
  };

  /**
   * Xác nhận đặt các món ăn đã chọn
   */
  const handleConfirmOrderSelected = async () => {
    setOrderLoading(true);
    try {
      const orderRequestDTO = {
        cartItemIds: selectedItems,
        deliveryAddress: 'Hà Nội',
        phoneNumber: '0987654321',
        paymentMethod: '',
        notes: note,
      };

      const _response = await CartService.placeSelectedOrder(orderRequestDTO);
      toast.success('🎉 Đặt hàng thành công!');
      setNote('');
      setOpenModal(false);
      setSelectedItems([]);
      await loadCart();
    } catch (error) {
      console.error('Error placing selected order:', {
        message: error.message,
        responseData: error.response?.data,
        status: error.response?.status,
      });
      toast.error('Không thể đặt hàng');
    } finally {
      setOrderLoading(false);
    }
  };

  /**
   * Lấy danh sách các món ăn đã chọn
   */
  const getSelectedItems = () => {
    return cart.cartItems.filter((item) => selectedItems.includes(item.id));
  };

  /**
   * Tính tổng tiền của danh sách món ăn
   */
  const getTotalPrice = (items) => {
    return items.reduce((total, item) => {
      const price = item.discountPrice > 0 ? item.discountPrice : item.price;
      return total + price * item.quantity;
    }, 0);
  };

  /**
   * Xóa nhiều món đã chọn
   */
  const handleRemoveSelected = async () => {
    if (selectedItems.length === 0) return;
    setOrderLoading(true);
    try {
      console.log('Selected Items to Remove:', selectedItems);
      const response = await CartService.removeSelectedItems(userId, selectedItems);
      console.log('Remove Response:', response.data);
      await loadCart();
      setSelectedItems([]);
      toast.success('✅ Đã xóa các món đã chọn khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing selected items:', error.response?.data || error.message);
      toast.error('Không thể xóa các món đã chọn');
    } finally {
      setOrderLoading(false);
    }
  };

  // Loading Skeleton Component
  const CartSkeleton = () => (
      <Box sx={{ mt: 2 }}>
        {[1, 2, 3].map((item) => (
            <Card key={item} sx={{ mb: 2, borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="rectangular" width={60} height={60} sx={{ borderRadius: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="40%" height={20} />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Skeleton variant="rectangular" width={40} height={24} />
                    <Skeleton variant="circular" width={32} height={32} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
        ))}
      </Box>
  );

  // Empty Cart Component
  const EmptyCart = () => (
      <Fade in timeout={800}>
        <Card sx={{
          textAlign: 'center',
          py: 6,
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}>
          <EmptyCartIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            Giỏ hàng của bạn đang trống
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Hãy thêm món ăn yêu thích vào giỏ hàng!
          </Typography>
          <Button
              variant="contained"
              size="large"
              startIcon={<ShoppingCartIcon />}
              sx={{
                borderRadius: 10,
                px: 4,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                }
              }}
          >
            Khám phá món ăn
          </Button>
        </Card>
      </Fade>
  );

  return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Loading Backdrop */}
        <Backdrop
            sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
            open={orderLoading}
        >
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={60} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Đang xử lý đơn hàng...
            </Typography>
          </Box>
        </Backdrop>

        {/* Snackbar thông báo */}
        <Snackbar
            open={!!message}
            autoHideDuration={3000}
            onClose={() => setMessage('')}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            TransitionComponent={SlideTransition}
        >
          <Alert
              severity="success"
              sx={{
                width: '100%',
                borderRadius: 3,
                fontWeight: 600,
                boxShadow: '0 8px 32px rgba(76, 175, 80, 0.3)'
              }}
          >
            {message}
          </Alert>
        </Snackbar>

        {/* Header với animation */}
        <Fade in timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Badge badgeContent={cart.totalItems} color="primary" sx={{ mb: 2 }}>
              <ShoppingBagIcon sx={{ fontSize: 48, color: 'primary.main' }} />
            </Badge>
            <Typography
                variant="h3"
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1
                }}
            >
              Giỏ hàng của bạn
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {cart.totalItems > 0 ? `${cart.totalItems} món ăn đang chờ bạn` : 'Chưa có món ăn nào'}
            </Typography>
          </Box>
        </Fade>

        {/* Kiểm tra user đã đăng nhập chưa */}
        {!isAuthenticated() ? (
            <Card sx={{ textAlign: 'center', py: 6, borderRadius: 4 }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Vui lòng đăng nhập để xem giỏ hàng
              </Typography>
              <Button variant="contained" size="large" sx={{ mt: 2, borderRadius: 10 }}>
                Đăng nhập
              </Button>
            </Card>
        ) : loading ? (
            <CartSkeleton />
        ) : cart.cartItems.length === 0 ? (
            <EmptyCart />
        ) : (
            <Fade in timeout={800}>
              <Box>
                {/* Selection Controls */}
                <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <FormControlLabel
                          control={
                            <Checkbox
                                checked={selectedItems.length === cart.cartItems.length && cart.cartItems.length > 0}
                                indeterminate={selectedItems.length > 0 && selectedItems.length < cart.cartItems.length}
                                onChange={handleSelectAll}
                                sx={{
                                  '& .MuiSvgIcon-root': {
                                    fontSize: 24,
                                    background: selectedItems.length > 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                                    borderRadius: '4px'
                                  }
                                }}
                            />
                          }
                          label={
                            <Typography variant="h6" fontWeight="600">
                              Chọn tất cả ({cart.cartItems.length})
                            </Typography>
                          }
                      />
                      <Stack direction="row" spacing={1}>
                        <Chip
                            label={`${selectedItems.length} đã chọn`}
                            color="primary"
                            variant={selectedItems.length > 0 ? "filled" : "outlined"}
                        />
                        <Chip
                            label={`${getTotalPrice(getSelectedItems()).toLocaleString('vi-VN')}đ`}
                            color="success"
                            icon={<LocalOfferIcon />}
                            sx={{ display: selectedItems.length > 0 ? 'flex' : 'none' }}
                        />
                      </Stack>
                    </Box>
                  </CardContent>
                </Card>

                {/* Cart Items */}
                <Stack spacing={2} sx={{ mb: 3 }}>
                  {cart.cartItems.map((item, index) => (
                      <Slide key={item.id} direction="right" in timeout={300 + index * 100}>
                        <Card sx={{
                          borderRadius: 3,
                          boxShadow: selectedItems.includes(item.id)
                              ? '0 8px 32px rgba(102, 126, 234, 0.2)'
                              : '0 4px 20px rgba(0,0,0,0.05)',
                          border: selectedItems.includes(item.id) ? '2px solid' : '1px solid',
                          borderColor: selectedItems.includes(item.id) ? 'primary.main' : 'grey.200',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            transform: 'translateY(-2px)'
                          }
                        }}>
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {/* Checkbox */}
                              <Checkbox
                                  checked={selectedItems.includes(item.id)}
                                  onChange={() => handleSelectItem(item.id)}
                                  sx={{
                                    '& .MuiSvgIcon-root': {
                                      fontSize: 24,
                                      color: selectedItems.includes(item.id) ? 'primary.main' : 'grey.400'
                                    }
                                  }}
                              />

                              {/* Food Image */}
                              <Box sx={{ position: 'relative' }}>
                                <img
                                    src={item.foodItemImage}
                                    alt={item.foodItemName}
                                    style={{
                                      width: 80,
                                      height: 80,
                                      borderRadius: 12,
                                      objectFit: 'cover',
                                      border: '3px solid #f0f0f0'
                                    }}
                                />
                                {item.discountPrice > 0 && (
                                    <Chip
                                        label="SALE"
                                        size="small"
                                        color="error"
                                        sx={{
                                          position: 'absolute',
                                          top: -8,
                                          right: -8,
                                          fontSize: '10px',
                                          fontWeight: 'bold'
                                        }}
                                    />
                                )}
                              </Box>

                              {/* Food Info */}
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" fontWeight="600" gutterBottom>
                                  {item.foodItemName}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {item.discountPrice > 0 ? (
                                      <>
                                        <Typography
                                            variant="body2"
                                            sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                        >
                                          {item.price?.toLocaleString('vi-VN')}đ
                                        </Typography>
                                        <Typography variant="h6" color="error.main" fontWeight="bold">
                                          {item.discountPrice?.toLocaleString('vi-VN')}đ
                                        </Typography>
                                      </>
                                  ) : (
                                      <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        {item.price?.toLocaleString('vi-VN')}đ
                                      </Typography>
                                  )}
                                </Box>
                              </Box>

                              {/* Quantity Controls */}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Tooltip title="Giảm số lượng">
                                  <IconButton
                                      size="small"
                                      onClick={() => handleUpdateQuantity(item.foodItemId, item.quantity - 1)}
                                      disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                                      sx={{
                                        bgcolor: 'grey.100',
                                        '&:hover': { bgcolor: 'grey.200' },
                                        '&:disabled': { bgcolor: 'grey.50' }
                                      }}
                                  >
                                    {updatingItems.has(item.id) ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <RemoveIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                <Chip
                                    label={item.quantity}
                                    color="primary"
                                    sx={{
                                      minWidth: 50,
                                      fontWeight: 'bold',
                                      fontSize: '16px'
                                    }}
                                />

                                <Tooltip title="Tăng số lượng">
                                  <IconButton
                                      size="small"
                                      onClick={() => handleUpdateQuantity(item.foodItemId, item.quantity + 1)}
                                      disabled={updatingItems.has(item.id)}
                                      sx={{
                                        bgcolor: 'primary.50',
                                        '&:hover': { bgcolor: 'primary.100' },
                                        color: 'primary.main'
                                      }}
                                  >
                                    {updatingItems.has(item.id) ? (
                                        <CircularProgress size={16} />
                                    ) : (
                                        <AddIcon fontSize="small" />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              {/* Total Price */}
                              <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                                <Typography variant="h6" color="success.main" fontWeight="bold">
                                  {((item.discountPrice > 0 ? item.discountPrice : item.price) * item.quantity).toLocaleString('vi-VN')}đ
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Slide>
                  ))}
                </Stack>

                {/* Summary Card */}
                <Card sx={{
                  borderRadius: 4,
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.15)',
                  background: 'linear-gradient(135deg, #f8f9ff 0%, #e3f2fd 100%)'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Box>
                        <Typography variant="h5" fontWeight="bold" gutterBottom>
                          Tổng quan đơn hàng
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Chip
                              icon={<ShoppingCartIcon />}
                              label={`${cart.totalItems} món`}
                              color="primary"
                              variant="outlined"
                          />
                          <Chip
                              icon={<CheckCircleIcon />}
                              label={`${selectedItems.length} đã chọn`}
                              color="success"
                              variant={selectedItems.length > 0 ? "filled" : "outlined"}
                          />
                        </Stack>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        {selectedItems.length > 0 && (
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                              {getTotalPrice(getSelectedItems()).toLocaleString('vi-VN')}đ
                            </Typography>
                        )}
                        <Typography variant="h5" color="success.main" fontWeight="bold">
                          Tổng: {getTotalPrice(cart.cartItems).toLocaleString('vi-VN')}đ
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                          variant="outlined"
                          color="error"
                          size="large"
                          disabled={selectedItems.length === 0 || orderLoading}
                          onClick={handleRemoveSelected}
                          startIcon={<DeleteOutlineIcon />}
                          sx={{
                            borderRadius: 3,
                            px: 3,
                            borderWidth: 2,
                            '&:hover': { borderWidth: 2 }
                          }}
                      >
                        Xóa món đã chọn
                      </Button>

                      <Button
                          variant="contained"
                          size="large"
                          disabled={selectedItems.length === 0 || orderLoading}
                          onClick={handleOrderSelected}
                          startIcon={<ShoppingBagIcon />}
                          sx={{
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontSize: '16px',
                            fontWeight: 'bold',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            },
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                          }}
                      >
                        Đặt hàng ngay
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Dialog xác nhận đặt hàng */}
                <Dialog
                    open={openModal}
                    onClose={() => !orderLoading && setOpenModal(false)}
                    maxWidth="md"
                    fullWidth
                    TransitionComponent={SlideTransition}
                    PaperProps={{
                      sx: { borderRadius: 4 }
                    }}
                >
                  <DialogTitle sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    textAlign: 'center',
                    py: 3
                  }}>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedItems.length > 0 ? 'Xác nhận đặt món đã chọn' : 'Xác nhận đặt tất cả đơn hàng'}
                    </Typography>
                  </DialogTitle>

                  <DialogContent sx={{ p: 0 }}>
                    <TableContainer>
                      <Table>
                        <TableHead sx={{ bgcolor: 'grey.50' }}>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Món ăn</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Số lượng</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Đơn giá</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Tổng tiền</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {(selectedItems.length > 0 ? getSelectedItems() : cart.cartItems).map((item) => (
                              <TableRow key={item.id} hover>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <img
                                        src={item.foodItemImage}
                                        alt={item.foodItemName}
                                        style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                                    />
                                    <Typography fontWeight="medium">{item.foodItemName}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={item.quantity} size="small" color="primary" />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'medium' }}>
                                  {(item.discountPrice > 0 ? item.discountPrice : item.price)?.toLocaleString('vi-VN')}đ
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                                  {((item.discountPrice > 0 ? item.discountPrice : item.price) * item.quantity).toLocaleString('vi-VN')}đ
                                </TableCell>
                              </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <Box sx={{ p: 3, bgcolor: 'primary.50', textAlign: 'center' }}>
                      <Typography variant="h4" color="primary.main" fontWeight="bold">
                        Tổng tiền: {getTotalPrice(selectedItems.length > 0 ? getSelectedItems() : cart.cartItems).toLocaleString('vi-VN')}đ
                      </Typography>
                    </Box>

                    <Box sx={{ p: 3 }}>
                      <TextField
                          label="Ghi chú cho đơn hàng"
                          fullWidth
                          multiline
                          minRows={3}
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          placeholder="Nhập ghi chú đặc biệt cho đơn hàng..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                      />
                    </Box>
                  </DialogContent>

                  <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenModal(false)}
                        disabled={orderLoading}
                        size="large"
                        sx={{ borderRadius: 2, px: 3 }}
                    >
                      Hủy bỏ
                    </Button>
                    <Button
                        onClick={selectedItems.length > 0 ? handleConfirmOrderSelected : handleConfirmOrderAll}
                        variant="contained"
                        size="large"
                        disabled={orderLoading}
                        startIcon={orderLoading ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          py: 1,
                          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                          },
                          '&:disabled': {
                            background: 'linear-gradient(135deg, #ccc 0%, #bbb 100%)',
                          }
                        }}
                    >
                      {orderLoading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
                    </Button>
                  </DialogActions>
                </Dialog>
              </Box>
            </Fade>
        )}
      </Container>
  );
}