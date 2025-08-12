import { createTheme } from "@mui/material/styles";

const customTheme = createTheme({
    palette: {
        primary: {
            main: "#667eea",
            dark: "#764ba2",
        },
        error: {
            main: "#ff0000",    // màu cho nút Xóa
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    borderRadius: "8px",
                },
            },
        },
    },
});
export default customTheme;
