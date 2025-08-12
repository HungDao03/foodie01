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
} from '@mui/material';
import { styled, alpha, useTheme } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Notifications as NotificationsIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Search as SearchIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Clear as ClearIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useThemeStore from "../../../store/dark-light.jsx";
import useSearchStore from "../../../store/searchStore.jsx";
import authService from "../../../../service/authService.js";
import * as PropTypes from "prop-types";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background:
        theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, #333 0%, #555 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    backdropFilter: 'blur(10px)',
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['background', 'color'], {
        duration: theme.transitions.duration.standard,
    }),
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

function SearchIconWrapper() {
    return null;
}

SearchIconWrapper.propTypes = {children: PropTypes.node};

function Header({ onToggleSidebar }) {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { searchKeyword, setSearchKeyword, isSearching, searchFoods, clearSearch } = useSearchStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const theme = useTheme();
    const unreadCount = 0;

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
        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    const handleProfile = () => {
        handleProfileMenuClose();
        navigate('/admin/profile');
    };

    const handleSettings = () => {
        handleProfileMenuClose();
        toast.success('Chức năng đang phát triển');
    };

    const handleSearchInput = (e) => {
        const keyword = e.target.value;
        setSearchKeyword(keyword);
        searchFoods(keyword);
    };

    const isProfileMenuOpen = Boolean(anchorEl);

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={theme.palette.mode}
                toastStyle={{
                    background:
                        theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #333 0%, #555 100%)'
                            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: theme.palette.text.primary,
                    borderRadius: '8px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                }}
            />

            <StyledAppBar position="fixed">
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="toggle menu"
                        onClick={onToggleSidebar}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 0 }}>
                        <Typography
                            variant="h6"
                            component="div"
                            sx={{
                                fontWeight: 'bold',
                                color: theme.palette.text.primary,
                                mr: 2,
                            }}
                        >
                            User Dashboard
                        </Typography>
                    </Box>

                    <Search>
                        <SearchIconWrapper>
                            {isSearching ? (
                                <CircularProgress size={20} sx={{ color: 'inherit' }} />
                            ) : (
                                <SearchIcon />
                            )}
                        </SearchIconWrapper>
                        <StyledInputBase
                            placeholder={isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm món ăn...'}
                            inputProps={{ 'aria-label': 'search' }}
                            value={searchKeyword}
                            onChange={handleSearchInput}
                        />
                        {searchKeyword && (
                            <IconButton
                                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                                onClick={clearSearch}
                            >
                                <ClearIcon sx={{ color: 'inherit', fontSize: 20 }} />
                            </IconButton>
                        )}
                    </Search>

                    <Box sx={{ flexGrow: 1 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                            <IconButton
                                color="inherit"
                                onClick={() => toast('Chức năng đang phát triển')}
                                aria-label={`${unreadCount} thông báo mới`}
                            >
                                <Badge badgeContent={unreadCount} color="error">
                                    <NotificationsIcon />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        <Tooltip title="Tài khoản">
                            <IconButton
                                edge="end"
                                aria-label="account of current user"
                                aria-controls="primary-search-account-menu"
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: alpha(theme.palette.common.white, 0.2),
                                        color: 'white',
                                    }}
                                >
                                    A
                                </Avatar>
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Toolbar>
            </StyledAppBar>

            <Menu
                anchorEl={anchorEl}
                id="primary-search-account-menu"
                keepMounted
                open={isProfileMenuOpen}
                onClose={handleProfileMenuClose}
                PaperProps={{
                    elevation: 8,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        bgcolor: 'background.paper',
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                        minWidth: 200,
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleProfile}>
                    <ListItemIcon>
                        <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Hồ sơ</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                        <SettingsIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Cài đặt</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout} disabled={isSearching}>
                    <ListItemIcon>
                        {isSearching ? (
                            <CircularProgress size={20} color="inherit" />
                        ) : (
                            <LogoutIcon fontSize="small" />
                        )}
                    </ListItemIcon>
                    <ListItemText>Đăng xuất</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}

export default Header;