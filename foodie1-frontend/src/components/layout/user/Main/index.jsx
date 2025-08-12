import { Box, useMediaQuery, useTheme, Drawer } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import Header from "../Header";
import Sidebar from "../Sidebar";

function MainUser() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);

    const toggleDrawer = () => {
        setDrawerOpen(prev => !prev);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <Header onToggleSidebar={toggleDrawer} />

            {/* Sidebar cho Desktop */}
            {!isMobile && <Sidebar />}

            {/* Sidebar Drawer cho Mobile */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={drawerOpen}
                    onClose={toggleDrawer}
                    ModalProps={{
                        keepMounted: true, // cải thiện performance trên mobile
                    }}
                >
                    <Sidebar onNavigate={toggleDrawer} />
                </Drawer>
            )}

            {/* Nội dung chính */}
            <Box
                className="main-content"
                sx={{
                    ml: { xs: 0, md: '240px' },
                    pt: 8,
                    px: { xs: 1, md: 3 },
                    minHeight: 'calc(100vh - 64px)',
                    transition: 'margin-left 0.3s',
                    boxSizing: 'border-box',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}

export default MainUser;