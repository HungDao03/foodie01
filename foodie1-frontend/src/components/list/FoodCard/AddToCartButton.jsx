import React, { useState } from 'react';
import { Button, CircularProgress, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CheckIcon from '@mui/icons-material/Check';
import CartService from '../../../service/cartService.js';
import { getCurrentUserId, isAuthenticated } from '../../../utils/authUtils.js';
import { toast } from 'react-toastify';

const AddToCartButton = ({
                           foodItem,
                           quantity = 1,
                           variant = "contained",
                           size = "medium",
                           fullWidth = false,
                           sx = {},               // Cho phép truyền style tùy chỉnh
                           onClick = null         // Callback gọi sau khi thêm giỏ thành công
                         }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleAddToCart = async (e) => {
    e?.stopPropagation(); // Ngăn sự kiện nổi bọt nếu có
    try {
      setLoading(true);
      setSuccess(false);

      // Kiểm tra đăng nhập
      if (!isAuthenticated()) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      const userId = getCurrentUserId();
      await CartService.addItemToCart(userId, foodItem.id, quantity);

      setSuccess(true);
      toast.success('Đã thêm vào giỏ hàng!');

      // Gọi callback nếu có (ví dụ để setSnackbar ở bên ngoài)
      if (onClick) onClick(e);

      // Reset success state sau 2 giây
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (success) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckIcon sx={{ fontSize: 18 }} />
          Đã thêm
        </Box>
      );
    }
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} color="inherit" />
          Đang thêm...
        </Box>
      );
    }
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <ShoppingCartIcon sx={{ fontSize: 18 }} />
        Thêm vào giỏ
      </Box>
    );
  };

  const getButtonStyles = () => {
    const baseStyles = {
      fontWeight: 700,
      borderRadius: 2.5,
      textTransform: 'none',
      fontSize: '0.85rem',
      py: 1,
      minHeight: 40,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        transition: 'left 0.5s',
      },
      '&:hover::before': {
        left: '100%',
      },
      ...sx
    };

    if (success) {
      return {
        ...baseStyles,
        bgcolor: 'success.main',
        color: 'white',
        '&:hover': {
          bgcolor: 'success.dark',
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(76,175,80,0.4)',
        }
      };
    }

    if (loading) {
      return {
        ...baseStyles,
        bgcolor: 'info.main',
        color: 'white',
        cursor: 'not-allowed',
        '&:hover': {
          bgcolor: 'info.main',
          transform: 'none',
        }
      };
    }

    return baseStyles;
  };

  return (
    <Button
      variant={variant}
      color="primary"
      size={size}
      fullWidth={fullWidth}
      onClick={handleAddToCart}
      disabled={loading || success}
      sx={getButtonStyles()}
    >
      {getButtonContent()}
    </Button>
  );
};

export default AddToCartButton;
