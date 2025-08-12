import AuthService from '../service/authService';

/**
 * Lấy thông tin user hiện tại
 * @returns {Object|null} Thông tin user hoặc null nếu chưa đăng nhập
 */
export const getCurrentUser = () => {
  return AuthService.getCurrentUser();
};

/**
 * Lấy userId của user hiện tại
 * @returns {number|null} User ID hoặc null nếu chưa đăng nhập
 */
export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user?.id || null;
};

/**
 * Kiểm tra user đã đăng nhập chưa
 * @returns {boolean} True nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Kiểm tra user có phải admin không
 * @returns {boolean} True nếu là admin, false nếu không
 */
export const isAdmin = () => {
  return AuthService.isAdmin();
}; 