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
    Drawer,
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Clear as ClearIcon, LightMode as LightModeIcon, DarkMode as DarkModeIcon,
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

function AdminHeader({ onToggleSidebar }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const { searchKeyword, setSearchKeyword, isSearching, searchFoods, clearSearch } = useSearchStore();
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
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

    const handleNotifToggle = () => {
        setDrawerOpen(!drawerOpen);

    };

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

    const isProfileMenuOpen = Boolean(anchorEl);

    return (
        <>
            <ToastContainer position="top-right" autoClose={3000} />
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


                    <Tooltip title="Thông báo">
                        <IconButton color="inherit" onClick={handleNotifToggle}>
                            <Badge badgeContent={unreadCount} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Tài khoản">
                        <IconButton onClick={handleProfileMenuOpen} color="inherit">
                            <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2), color: 'white' }}>A</Avatar>
                        </IconButton>
                    </Tooltip>
                </Toolbar>
            </StyledAppBar>

            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleNotifToggle}
                PaperProps={{ sx: { width: 350, padding: 2 } }}
            >
                <Typography variant="h6" gutterBottom>Thông báo đơn hàng</Typography>
                {orders.length === 0 ? (
                    <Typography variant="body2">Không có đơn hàng chưa thanh toán.</Typography>
                ) : (
                    orders.map(order => (
                        <Box
                            key={order.id}
                            sx={{
                                p: 1.5,
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.error.light, 0.08),
                                borderLeft: '4px solid red'
                            }}
                        >
                            <Typography variant="body2">
                                <strong>{order.userName || 'Người dùng'}</strong> đã đặt món:
                                <strong>
                                    {order.foodName ||
                                        (order.items?.length > 0
                                            ? order.items.map(item => item.foodName).join(', ')
                                            : 'Không xác định')}
                                </strong>
                            </Typography>

                            <Typography variant="caption" color="error" fontWeight="bold">
                                Chưa thanh toán
                            </Typography>
                        </Box>
                    ))
                )}
            </Drawer>

            <Menu
                anchorEl={anchorEl}
                open={isProfileMenuOpen}
                onClose={handleProfileMenuClose}
                PaperProps={{ sx: { minWidth: 200 } }}
            >
                <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/admin/profile'); }}>
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
