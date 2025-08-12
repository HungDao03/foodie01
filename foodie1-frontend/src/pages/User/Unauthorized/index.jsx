import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <Container
            maxWidth="sm"
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 4,
            }}
        >
            <WarningAmberIcon sx={{ fontSize: 160, color: 'error.main' }} />

            <Typography variant="h5" fontWeight="bold">
                Bạn chưa đăng nhập
            </Typography>

            <Typography variant="body1" color="text.secondary">
                Xin quay về trang chủ để đăng nhập và tiếp tục sử dụng dịch vụ.
            </Typography>

            <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/')}
            >
                 Quay về trang chủ
            </Button>
        </Container>
    );
};

export default Unauthorized;
