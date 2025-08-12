import { createTheme } from '@mui/material/styles';

// Theme sáng
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#667eea',
            dark: '#764ba2',
        },
        error: {
            main: '#ff0000', // Màu cho nút Xóa
        },
        background: {
            default: '#f5f5f5', // Nền sáng
            paper: '#ffffff', // Nền cho Paper
        },
        text: {
            primary: '#333333',
            secondary: '#666666',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                },
            },
        },
    },
});

// Theme tối
export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#764ba2', // Đảo ngược màu chính để phù hợp chế độ tối
            dark: '#667eea',
        },
        error: {
            main: '#ff0000', // Giữ nguyên màu lỗi
        },
        background: {
            default: '#121212', // Nền tối
            paper: '#1d1d1d', // Nền cho Paper
        },
        text: {
            primary: '#ffffff',
            secondary: '#bbbbbb',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: '8px',
                },
            },
        },
    },
});