import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const VerifySuccessPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Tự động chuyển về trang chủ sau 5 giây
        const timer = setTimeout(() => {
            navigate("/");
        }, 5000);

        // Dọn dẹp timer khi component unmount
        return () => clearTimeout(timer);
    }, [navigate]);

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                textAlign: "center",
                bgcolor: "#f5f5f5",
            }}
        >
            <Typography variant="h3" sx={{ color: "#2e7d32", mb: 2, fontWeight: 700 }}>
                Xác minh thành công!
            </Typography>
            <Typography variant="h6" sx={{ color: "#555", mb: 4 }}>
                Tài khoản của bạn đã được kích hoạt. Bạn sẽ được chuyển về trang chủ trong 5 giây.
            </Typography>
            <Button
                variant="contained"
                sx={{
                    background: "linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: "12px",
                    px: 3,
                    py: 1,
                    "&:hover": {
                        background: "linear-gradient(135deg, #388e3c 0%, #66bb6a 100%)",
                    },
                }}
                onClick={() => navigate("/")}
            >
                Về trang chủ ngay
            </Button>
        </Box>
    );
};

export default VerifySuccessPage;