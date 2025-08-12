import React, { useState } from 'react';
import { Button } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
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

  const handleAddToCart = async (e) => {
    e?.stopPropagation(); // Ngăn sự kiện nổi bọt nếu có
    try {
      setLoading(true);

      // Kiểm tra đăng nhập
      if (!isAuthenticated()) {
        toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
        return;
      }

      const userId = getCurrentUserId();
      await CartService.addItemToCart(userId, foodItem.id, quantity);

      toast.success('Đã thêm vào giỏ hàng!');

      // Gọi callback nếu có (ví dụ để setSnackbar ở bên ngoài)
      if (onClick) onClick(e);
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      toast.error('Không thể thêm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  return (
      <Button
          variant={variant}
          color="primary"
          size={size}
          fullWidth={fullWidth}
          startIcon={<ShoppingCartIcon />}
          onClick={handleAddToCart}
          disabled={loading}
          sx={{
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            ...sx, // Gộp style từ props
          }}
      >
        {loading ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
      </Button>
  );
};

export default AddToCartButton;
