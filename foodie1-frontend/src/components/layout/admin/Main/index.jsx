import { Box, Drawer, useMediaQuery, useTheme } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../Sidebar/index.jsx";
import AdminHeader from "../Header/index.jsx";



function MainAdmin() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AdminHeader onToggleSidebar={toggleSidebar} />

            {/* Sidebar cố định cho desktop */}
            {!isMobile && <AdminSidebar />}

            {/* Sidebar Drawer cho mobile */}
            {isMobile && (
                <Drawer
                    anchor="left"
                    open={sidebarOpen}
                    onClose={toggleSidebar}
                    ModalProps={{ keepMounted: true }}
                    PaperProps={{ sx: { width: 240, mt: '64px' } }} // chiều cao trừ header
                >
                    <AdminSidebar onNavigate={toggleSidebar} />
                </Drawer>
            )}

            {/* Nội dung chính */}
            <Box
                className="main-content"
                sx={{
                    ml: { xs: 0, md: '240px' },
                    pt: 3,
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

export default MainAdmin;
