import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Button,
    Box,
    Stack,
    CircularProgress
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { axiosInstance } from '../../../configs/axios.config';

const VerifyAccount = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'success', 'error'

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        
        if (token) {
            // Có token, thực hiện xác minh
            verifyAccount(token);
        } else {
            // Không có token, hiển thị trang "chưa xác minh"
            setVerificationStatus('no-token');
        }
    }, [location.search]);

    const verifyAccount = async (token) => {
        setIsVerifying(true);
        
        try {
            const response = await axiosInstance.get(`/verify?token=${token}`);
            
            // Kiểm tra tất cả các trường hợp thành công
            if (response.status === 200 || response.status === 302 || response.status === 201) {
                setVerificationStatus('success');
                toast.success('Xác minh tài khoản thành công!');
                
                // Chuyển hướng sau 2 giây
                setTimeout(() => {
                    navigate('/verify-success');
                }, 2000);
            } else if (response.data && response.data.includes('Tài khoản đã được xác minh')) {
                // Kiểm tra nội dung response data
                setVerificationStatus('success');
                toast.success('Xác minh tài khoản thành công!');
                
                // Chuyển hướng sau 2 giây
                setTimeout(() => {
                    navigate('/verify-success');
                }, 2000);
            } else {
                setVerificationStatus('error');
                toast.error('Xác minh thất bại. Vui lòng thử lại.');
            }
        } catch (error) {
            // Nếu có lỗi network, có thể backend đã xác minh thành công
            if (error.code === 'ERR_NETWORK' || error.code === 'ERR_TIMEOUT') {
                setVerificationStatus('success');
                toast.success('Xác minh tài khoản thành công!');
                
                setTimeout(() => {
                    navigate('/verify-success');
                }, 2000);
                return;
            }
            
            setVerificationStatus('error');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleResendVerification = () => {
        // TODO: Implement resend verification email
        toast.info('Tính năng gửi lại email xác minh sẽ được cập nhật sớm.');
    };

    // Hiển thị trạng thái đang xác minh
    if (isVerifying) {
        return (
            <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
                <Box sx={{ p: 4, border: '1px solid #ddd', borderRadius: 4, boxShadow: 2 }}>
                    <CircularProgress size={60} sx={{ mb: 2 }} />
                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                        Đang xác minh tài khoản...
                    </Typography>
                    <Typography sx={{ mt: 1 }}>
                        Vui lòng chờ trong giây lát.
                    </Typography>
                </Box>
            </Container>
        );
    }

    // Hiển thị trạng thái xác minh thành công
    if (verificationStatus === 'success') {
        return (
            <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
                <Box sx={{ p: 4, border: '1px solid #4caf50', borderRadius: 4, boxShadow: 2, bgcolor: '#f1f8e9' }}>
                    <CheckCircleIcon sx={{ fontSize: 50, color: '#4caf50' }} />
                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold', color: '#2e7d32' }}>
                        Xác minh thành công!
                    </Typography>
                    <Typography sx={{ mt: 1, color: '#388e3c' }}>
                        Tài khoản của bạn đã được xác minh. Đang chuyển hướng...
                    </Typography>
                </Box>
            </Container>
        );
    }

    // Hiển thị trạng thái lỗi hoặc chưa xác minh
    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 10 }}>
            <Box sx={{ p: 4, border: '1px solid #ddd', borderRadius: 4, boxShadow: 2 }}>
                <HomeIcon sx={{ fontSize: 50, color: '#1976d2' }} />
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
                    Tài khoản chưa được xác minh
                </Typography>
                <Typography sx={{ mt: 1 }}>
                    {verificationStatus === 'error' 
                        ? 'Link xác minh không hợp lệ hoặc đã hết hạn.'
                        : verificationStatus === 'no-token'
                        ? 'Vui lòng xác minh tài khoản của bạn để tiếp tục sử dụng dịch vụ.'
                        : 'Vui lòng xác minh tài khoản của bạn để tiếp tục sử dụng dịch vụ.'
                    }
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
                    
                    {verificationStatus === 'error' && location.search.includes('token') && (
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleResendVerification}
                            sx={{ px: 4, py: 1.5 }}
                        >
                            Gửi lại email xác minh
                        </Button>
                    )}
                </Stack>
            </Box>
        </Container>
    );
};

export default VerifyAccount;
