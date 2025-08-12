import {
    Box,
    Typography,
    Stack,
    List,
    ListItem,
    ListItemButton,
    ListItemText
} from "@mui/material";
import { styled } from "@mui/material/styles";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CategoryIcon from "@mui/icons-material/Category";
import AnalyticsIcon from "@mui/icons-material/Analytics";

import {useNavigate, useLocation} from "react-router-dom";
import {toast} from "react-toastify";

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
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
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
    transition: 'all 0.3s cubic-bezier(.4,2,.6,1)',
    justifyContent: 'flex-start',
    color: theme.palette.text.primary,

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
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
});

const MenuText = styled(Typography)(({ theme }) => ({
    opacity: 1,
    transform: 'translateX(0)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    marginLeft: '12px',
    color: theme.palette.text.primary
}));

const SectionDivider = styled(Box)(({ theme }) => ({
    height: '1px',
    backgroundColor: theme.palette.divider,
    margin: '16px 0',
    opacity: 0.3
}));

function AdminSidebar({ onNavigate }) {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem("user"));

    const mainMenuItems = [
        { text: "Dashboard", icon: <DashboardIcon fontSize="inherit" />, path: "/admin" },
        { text: "Quản lý người dùng", icon: <PeopleIcon fontSize="inherit" />, path: "/admin/users" },
        { text: "Quản lý món ăn", icon: <InventoryIcon fontSize="inherit" />, path: "/admin/fooditems" },
        { text: "Quản lý danh mục", icon: <CategoryIcon fontSize="inherit" />, path: "/admin/categories" },
        { text: "Quản lý đơn hàng", icon: <ShoppingCartIcon fontSize="inherit" />, path: "/admin/orders" },
        { text: "Báo cáo & Thống kê", icon: <AnalyticsIcon fontSize="inherit" />,onclick: ()=>toast.info("Chức năng ang phát triển") },
    ];




    return (
        <StyledBox>
            <GreetingText className="greeting-text">
                ‍♂️ Xin chào, {user.fullName ||user.name }
            </GreetingText>

            <List sx={{ p: 0 }}>
                {mainMenuItems.map((item, index) => (
                    <ListItem key={index} disablePadding sx={{ display: 'flex', justifyContent: 'center' }}>
                        <StyledListItemButton
                            onClick={() => {
                                if (item.onclick) {
                                    item.onclick();
                                } else if (item.path) {
                                    navigate(item.path);
                                    if (onNavigate) onNavigate();
                                }
                            }}
                            active={item.path && location.pathname === item.path}
                        >
                            <IconWrapper sx={{ fontSize: 24, height: 44 }}>
                                {item.icon}
                            </IconWrapper>
                            <MenuText className="menu-text">
                                {item.text}
                            </MenuText>
                        </StyledListItemButton>
                    </ListItem>
                ))}

                <SectionDivider />


            </List>
        </StyledBox>
    );
}

export default AdminSidebar;