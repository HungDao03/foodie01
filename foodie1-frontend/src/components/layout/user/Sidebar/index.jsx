import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemButton
} from "@mui/material";
import { styled } from "@mui/material/styles";

import HomeIcon from "@mui/icons-material/Home";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import FavoriteIcon from "@mui/icons-material/Favorite";
import HistoryIcon from "@mui/icons-material/History";
import ChatIcon from "@mui/icons-material/Chat";

import { useNavigate, useLocation } from "react-router-dom";
const StyledBox = styled(Box)(({ theme }) => ({
    background: theme.palette.background.paper,
    backdropFilter: 'blur(10px)',
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
    width: '240px',
    height: 'calc(100vh - 64px)',
    position: 'fixed',
    top: '64px',
    left: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease',
    borderRight: '1px solid #e0e0e0',
}));

const GreetingText = styled(Typography)(({ theme }) => ({
    marginBottom: '16px',
    fontSize: '0.9rem',
    color: theme.palette.text.primary,
    fontWeight: 500
}));

const StyledListItemButton = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'active'
})(({ theme, active }) => ({
    borderRadius: '18px',
    padding: '12px 20px',
    margin: '6px 0',
    fontWeight: 700,
    fontSize: '1rem',
    justifyContent: 'flex-start',
    color: theme.palette.text.primary,
    transition: 'all 0.3s ease',

    ...(active && {
        background: 'linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)',
        color: '#fff',
        boxShadow: theme.shadows[4],
    }),

    '&:hover': {
        background: 'linear-gradient(135deg, #4ecdc4 0%, #ff6b6b 100%)',
        color: '#fff',
        boxShadow: theme.shadows[2],
    },
}));

const IconWrapper = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
    height: 44,
    width: 32
});

const MenuText = styled(Typography)(({ theme }) => ({
    marginLeft: '12px',
    whiteSpace: 'nowrap',
    color: theme.palette.text.primary
}));

// === Component ===

function Sidebar({ onNavigate }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));

    const menuItems = [
        { text: "Trang chủ", icon: <HomeIcon />, path: "/user" },
        { text: "Tài khoản", icon: <AccountCircleIcon />, path: "/user/account" },
        { text: "Giỏ hàng", icon: <ShoppingCartIcon />, path: "/user/cart" },
        { text: "Yêu thích", icon: <FavoriteIcon />, path: "/user/favorites" },
        { text: "Lịch sử đặt hàng", icon: <HistoryIcon />, path: "/user/history" },
        { text: "Nhắn tin", icon: <ChatIcon fontSize="inherit" />, path: "/user/chat" }
    ];

    return (
        <StyledBox>
            <GreetingText>
                🙋‍♂️ Xin chào, {user ? (user.fullName || user.name) : "Khách"}
            </GreetingText>

            <List sx={{ p: 0 }}>
                {menuItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ display: 'flex', justifyContent: 'center' }}>
                        <StyledListItemButton
                            onClick={() => {
                                if (item.onClick) {
                                    item.onClick();
                                } else if (item.path) {
                                    navigate(item.path);
                                    if (onNavigate) onNavigate(); // Đóng Drawer khi chọn menu
                                }
                            }}
                            active={location.pathname === item.path}
                        >
                            <IconWrapper>{item.icon}</IconWrapper>
                            <MenuText>{item.text}</MenuText>
                        </StyledListItemButton>
                    </ListItem>
                ))}
            </List>
        </StyledBox>
    );
}

export default Sidebar;