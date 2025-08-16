// AdminHeader.js
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Badge,
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    InputBase,
    Tooltip,
    CircularProgress,
    List,
    ListItemButton,
    Chip,
    Grow,
    ListItemAvatar,
    Typography as MuiTypography,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Clear as ClearIcon, 
    LightMode as LightModeIcon, 
    DarkMode as DarkModeIcon,
    Circle as CircleIcon,
    Restaurant as RestaurantIcon,
    LocalShipping as ShippingIcon,
    Payment as PaymentIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import {useEffect, useRef, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useSearchStore from '../../../store/searchStore.jsx';
import authService from '../../../../service/authService.js';
import OrderService from "../../../../service/orderService.js";
import useOrderStore from "../../../store/useOrderStore.jsx";
import useThemeStore from "../../../store/dark-light.jsx";


const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background:
        theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #333 0%, #555 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
    zIndex: theme.zIndex.drawer + 1,
}));

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 3,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
        marginLeft: theme.spacing(3),
        width: 'auto',
    },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 8, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

// Styled components for notifications
const NotificationBadge = styled(Badge)(({ theme }) => ({
    '& .MuiBadge-badge': {
        backgroundColor: '#ff4757',
        color: 'white',
        fontSize: '0.75rem',
        fontWeight: 'bold',
        minWidth: '20px',
        height: '20px',
        borderRadius: '10px',
        border: '2px solid white',
        boxShadow: '0 2px 8px rgba(255, 71, 87, 0.3)',
        animation: 'pulse 2s infinite',
        '@keyframes pulse': {
            '0%': {
                boxShadow: '0 0 0 0 rgba(255, 71, 87, 0.7)',
            },
            '70%': {
                boxShadow: '0 0 0 10px rgba(255, 71, 87, 0)',
            },
            '100%': {
                boxShadow: '0 0 0 0 rgba(255, 71, 87, 0)',
            },
        },
    },
}));

const NotificationIconButton = styled(IconButton)(({ theme }) => ({
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'scale(1.1)',
        backgroundColor: alpha(theme.palette.common.white, 0.1),
        '& .MuiSvgIcon-root': {
            transform: 'rotate(15deg)',
        },
    },
    '& .MuiSvgIcon-root': {
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontSize: '1.5rem',
    },
}));

const NotificationMenu = styled(Menu)(({ theme }) => ({
    '& .MuiPaper-root': {
        background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        backdropFilter: 'blur(20px)',
        minWidth: '400px',
        maxWidth: '500px',
        maxHeight: '600px',
        overflow: 'hidden',
    },
}));

const NotificationHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 3),
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)'
        : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '& .MuiTypography-root': {
        fontWeight: 'bold',
        fontSize: '1.1rem',
    },
}));

const NotificationItem = styled(ListItemButton)(({ theme, urgent }) => ({
    padding: theme.spacing(2, 3),
    transition: 'all 0.2s ease',
    borderLeft: urgent ? `4px solid #e74c3c` : '4px solid transparent',
    backgroundColor: urgent 
        ? alpha(theme.palette.error.main, 0.08)
        : 'transparent',
    '&:hover': {
        backgroundColor: urgent 
            ? alpha(theme.palette.error.main, 0.15)
            : alpha(theme.palette.primary.main, 0.1),
        transform: 'translateX(4px)',
    },
    '& .MuiListItemAvatar-root': {
        minWidth: '48px',
    },
    '& .MuiListItemText-primary': {
        fontWeight: urgent ? 'bold' : 'normal',
        color: urgent ? theme.palette.error.main : theme.palette.text.primary,
    },
    '& .MuiListItemText-secondary': {
        fontSize: '0.875rem',
        lineHeight: 1.4,
    },
}));

const NotificationAvatar = styled(Box)(({ theme, urgent }) => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: urgent ? '#e74c3c' : '#3498db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    boxShadow: urgent 
        ? `0 4px 12px ${alpha('#e74c3c', 0.3)}`
        : `0 4px 12px ${alpha('#3498db', 0.3)}`,
}));

const UrgentChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#e74c3c',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.75rem',
    height: '20px',
    '& .MuiChip-label': {
        padding: '0 8px',
    },
}));

function AdminHeader({ onToggleSidebar }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const { searchKeyword, setSearchKeyword, isSearching, searchFoods, clearSearch } = useSearchStore();
    const [anchorEl, setAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const { orders, unreadCount, setOrders } = useOrderStore();
    const prevOrderIds = useRef([]);
    const { isDarkMode, toggleTheme } = useThemeStore();


    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await OrderService.getAllOrders();
                const unpaidOrders = res.data.filter(order => order.paymentStatus === 'NOT_PAID');
                const currentIds = unpaidOrders.map(o => o.id).sort();
                const prevIds = prevOrderIds.current;

                const isDifferent =
                    currentIds.length !== prevIds.length ||
                    !currentIds.every((id, index) => id === prevIds[index]);

                if (isDifferent) {
                    setOrders(res.data); // gọi store
                    prevOrderIds.current = currentIds;
                }
            } catch (err) {
                console.error('Lỗi fetch đơn hàng:', err);
            }
        };

        fetchOrders();
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        authService.logout();
        handleProfileMenuClose();
        toast.success('Đăng xuất thành công!');
        setTimeout(() => navigate('/'), 1500);
    };

    const handleSearchInput = (e) => {
        const keyword = e.target.value;
        setSearchKeyword(keyword);
        searchFoods(keyword);
    };

    const handleNotificationMenuOpen = (event) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleNotificationMenuClose = () => {
        setNotificationAnchorEl(null);
    };

    const handleNotificationClick = (order) => {
        // Xử lý khi click vào thông báo đơn hàng
        handleNotificationMenuClose();
        toast.success(`Đã xem chi tiết đơn hàng #${order.id}`);
        // Có thể navigate đến trang chi tiết đơn hàng
    };

    const handleNotifToggle = () => {
        // Thay thế bằng dropdown menu
        toast.info('Sử dụng dropdown menu thông báo bên cạnh');
    };

    const isProfileMenuOpen = Boolean(anchorEl);
    const isNotificationMenuOpen = Boolean(notificationAnchorEl);

    // Chuyển đổi orders thành notifications format
    const notifications = orders.map(order => ({
        id: order.id,
        type: 'order',
        title: `Đơn hàng #${order.id} - ${order.userName || 'Người dùng'}`,
        message: `Đã đặt: ${order.foodName || (order.items?.length > 0 ? order.items.map(item => item.foodName).join(', ') : 'Không xác định')}`,
        time: 'Vừa xong',
        urgent: true,
        order: order,
    }));

    return (
        <>
            <ToastContainer 
                position="top-right" 
                autoClose={3000}
                toastStyle={{
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #333 0%, #555 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: theme.palette.text.primary,
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
            />
            <StyledAppBar position="fixed">
                <Toolbar>
                    <IconButton edge="start" color="inherit" onClick={onToggleSidebar} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
                        Admin Dashboard
                    </Typography>

                    <Search>
                        <StyledInputBase
                            placeholder={isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm món ăn...'}
                            value={searchKeyword}
                            onChange={handleSearchInput}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                        {searchKeyword && (
                            <IconButton
                                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                                onClick={clearSearch}
                            >
                                <ClearIcon sx={{ fontSize: 20 }} />
                            </IconButton>
                        )}
                    </Search>

                    <Tooltip title={isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'}>
                        <IconButton
                            color="inherit"
                            onClick={toggleTheme}
                            aria-label={isDarkMode ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
                        >
                            {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Thông báo đơn hàng">
                        <NotificationIconButton 
                            color="inherit" 
                            onClick={handleNotificationMenuOpen}
                            aria-label={`${unreadCount} đơn hàng chưa thanh toán`}
                        >
                            <NotificationBadge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </NotificationBadge>
                        </NotificationIconButton>
                    </Tooltip>



                    <Tooltip title="Tài khoản">
                        <IconButton onClick={handleProfileMenuOpen} color="inherit">
                            <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}>A</Avatar>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </StyledAppBar>

            {/* Notification Menu */}
            <NotificationMenu
                anchorEl={notificationAnchorEl}
                open={isNotificationMenuOpen}
                onClose={handleNotificationMenuClose}
                TransitionComponent={Grow}
                transitionDuration={300}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <NotificationHeader>
                    <MuiTypography variant="h6">
                        Thông báo đơn hàng
                    </MuiTypography>
                    <UrgentChip 
                        label={`${unreadCount} khẩn cấp`}
                        size="small"
                    />
                </NotificationHeader>
                
                <List sx={{ p: 0, maxHeight: '400px', overflow: 'auto' }}>
                    {notifications.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <MuiTypography variant="body2" color="text.secondary">
                                Không có đơn hàng chưa thanh toán
                            </MuiTypography>
                        </Box>
                    ) : (
                        notifications.map((notification) => (
                            <NotificationItem
                                key={notification.id}
                                urgent={notification.urgent}
                                onClick={() => handleNotificationClick(notification.order)}
                                sx={{
                                    '&:not(:last-child)': {
                                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                    },
                                }}
                            >
                                <ListItemAvatar>
                                    <NotificationAvatar urgent={notification.urgent}>
                                        <WarningIcon />
                                    </NotificationAvatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={notification.title}
                                    secondary={
                                        <Box>
                                            <Box sx={{ mb: 0.5 }}>{notification.message}</Box>
                                            <Box sx={{ 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: 1,
                                                fontSize: '0.75rem',
                                                color: theme.palette.text.secondary,
                                            }}>
                                                <CircleIcon sx={{ fontSize: '0.5rem' }} />
                                                {notification.time}
                                            </Box>
                                        </Box>
                                    }
                                />
                                {notification.urgent && (
                                    <Box
                                        sx={{
                                            width: '8px',
                                            height: '8px',
                                            borderRadius: '50%',
                                            backgroundColor: '#e74c3c',
                                            ml: 1,
                                            animation: 'pulse 1.5s infinite',
                                        }}
                                    />
                                )}
                            </NotificationItem>
                        ))
                    )}
                </List>
                
                <Box sx={{ p: 2, textAlign: 'center', borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <MuiTypography 
                        variant="body2" 
                        sx={{ 
                            color: theme.palette.primary.main,
                            cursor: 'pointer',
                            '&:hover': { textDecoration: 'underline' }
                        }}
                    >
                        Xem tất cả đơn hàng
                    </MuiTypography>
                </Box>
            </NotificationMenu>

            <Menu
                anchorEl={anchorEl}
                open={isProfileMenuOpen}
                onClose={handleProfileMenuClose}
                PaperProps={{ sx: { minWidth: 200 } }}
            >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/account'); }}>
                    <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Hồ sơ</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { handleProfileMenuClose(); toast.info('Chức năng đang phát triển'); }}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>Cài đặt</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} disabled={isSearching}>
                    <ListItemIcon>
                        {isSearching ? <CircularProgress size={20} color="inherit" /> : <LogoutIcon fontSize="small" />}
                    </ListItemIcon>
                    <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}

export default AdminHeader;
