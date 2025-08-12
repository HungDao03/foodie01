import React from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Stack
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';

const VerifyAccount = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
            <Box sx={{ p: 4, border: '1px solid #ddd', borderRadius: 4, boxShadow: 2 }}>
                <HomeIcon sx={{ fontSize: 50, color: '#1976d2' }} />
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Tài khoản chưa được xác minh
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    Vui lòng xác minh tài khoản của bạn để tiếp tục sử dụng dịch vụ.
                </Typography>

                <Stack spacing={2} mt={4} alignItems="center">
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleGoHome}
                        sx={{ px: 4, py: 1.5 }}
                    >
                        Quay về trang chủ
                    </Button>
                </Stack>
            </Box>
        </Container>
    );
};

export default VerifyAccount;
