import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    TextField,
    Button,
    Typography,
    Box,
    InputAdornment,
    IconButton,
    Fade,
    CircularProgress,
    Alert,
    Avatar,
    Divider
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { X, User, Lock, Eye, EyeOff, LogIn, Chrome } from 'lucide-react';

import { toast } from 'react-toastify';
import useThemeStore from "../store/dark-light.jsx";
import authService from "../../service/authService.js";


// Styled components
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: theme.shape.borderRadius * 3,
        overflow: 'hidden',
        background: theme.palette.background.paper,
        boxShadow: `0 10px 30px ${theme.palette.primary.main}20`,
        maxWidth: '450px',
        width: '100%',
        margin: '16px',
        transition: 'all 0.3s ease',
    }
}));

const GradientHeader = styled(Box)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    color: theme.palette.text.primary,
    padding: theme.spacing(4, 3),
    position: 'relative',
    textAlign: 'center',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    marginBottom: theme.spacing(2),
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 1.5,
        backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f7fa',
        border: 'none',
        '& fieldset': {
            border: `2px solid transparent`,
        },
        '&:hover fieldset': {
            borderColor: `${theme.palette.primary.main}30`,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
        '&.Mui-focused': {
            color: theme.palette.primary.main,
        },
    },
}));

const GradientButton = styled(Button)(({ theme }) => ({
    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(1.5, 3),
    fontSize: '15px',
    fontWeight: 600,
    textTransform: 'none',
    color: theme.palette.text.primary,
    boxShadow: `0 6px 20px ${theme.palette.primary.main}20`,
    '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        boxShadow: `0 8px 25px ${theme.palette.primary.main}30`,
        transform: 'translateY(-2px)',
    },
    '&:active': {
        transform: 'translateY(0px)',
    },
    '&.Mui-disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.text.disabled,
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const GoogleButton = styled(Button)(({ theme }) => ({
    background: theme.palette.background.paper,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(1.5, 3),
    fontSize: '15px',
    fontWeight: 600,
    textTransform: 'none',
    color: theme.palette.text.primary,
    boxShadow: `0 4px 15px ${theme.palette.primary.main}10`,
    '&:hover': {
        background: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f7fa',
        borderColor: theme.palette.primary.main,
        boxShadow: `0 6px 20px ${theme.palette.primary.main}20`,
        transform: 'translateY(-2px)',
    },
    '&:active': {
        transform: 'translateY(0px)',
    },
    '&.Mui-disabled': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.text.disabled,
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    right: theme.spacing(1.5),
    top: theme.spacing(1.5),
    color: theme.palette.text.primary,
    backgroundColor: `${theme.palette.primary.main}20`,
    '&:hover': {
        backgroundColor: `${theme.palette.primary.main}30`,
        transform: 'scale(1.1)',
    },
    transition: 'all 0.2s ease',
}));

const IconAvatar = styled(Avatar)(({ theme }) => ({
    width: 64,
    height: 64,
    backgroundColor: `${theme.palette.primary.main}30`,
    margin: '0 auto 16px',
    border: `2px solid ${theme.palette.primary.main}40`,
}));

export default function LoginModal({ open, onClose, onRegisterClick }) {
    const navigate = useNavigate();
    const theme = useTheme();
    const { isDarkMode } = useThemeStore();
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await authService.login(formData);


            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data));

                const isAdmin = response.data.authorities.some(
                    auth => auth.authority === 'ROLE_ADMIN'
                );

                toast.success('Đăng nhập thành công!', {
                    position: "top-right",
                    autoClose: 3000,
                    theme: isDarkMode ? 'dark' : 'light'
                });

                setFormData({ username: '', password: '' });
                setError('');
                if (onClose) onClose();

                if (isAdmin) {
                    navigate('/admin');
                } else {
                    navigate('/user');
                }
            }
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
            toast.error('Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.', {
                position: "top-right",
                autoClose: 3000,
                theme: isDarkMode ? 'dark' : 'light'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8080/oauth2/authorization/google";
    };

    const handleRegisterClick = () => {
        if (onClose) onClose();
        if (onRegisterClick) onRegisterClick();
    };

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            TransitionComponent={Fade}
            transitionDuration={300}
            maxWidth={false}
        >
            <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                <GradientHeader>
                    <CloseButton onClick={onClose}>
                        <X size={20} />
                    </CloseButton>

                    <IconAvatar>
                        <LogIn size={32} />
                    </IconAvatar>

                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 1,
                            background: `linear-gradient(45deg, ${theme.palette.text.primary} 30%, ${theme.palette.text.secondary} 90%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            color: 'transparent',
                        }}
                    >
                        Chào mừng trở lại
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{ opacity: 0.8, fontWeight: 400, letterSpacing: '0.5px', color: theme.palette.text.primary }}
                    >
                        Đăng nhập để tiếp tục hành trình
                    </Typography>
                </GradientHeader>

                <Box sx={{ p: 3 }}>
                    <Box component="form" onSubmit={handleSubmit}>
                        <StyledTextField
                            fullWidth
                            required
                            label="Tên đăng nhập"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            autoFocus
                            autoComplete="username"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <User size={18} style={{ color: theme.palette.primary.main }} />
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Nhập tên đăng nhập của bạn"
                        />

                        <StyledTextField
                            fullWidth
                            required
                            label="Mật khẩu"
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock size={18} style={{ color: theme.palette.primary.main }} />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                            sx={{ color: theme.palette.primary.main, '&:hover': { backgroundColor: `${theme.palette.primary.main}10` } }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            placeholder="Nhập mật khẩu của bạn"
                        />

                        {error && (
                            <Alert
                                severity="error"
                                sx={{
                                    mb: 2,
                                    borderRadius: theme.shape.borderRadius,
                                    backgroundColor: `${theme.palette.error.main}10`,
                                    border: `1px solid ${theme.palette.error.main}20`,
                                    '& .MuiAlert-message': { width: '100%', textAlign: 'center', color: theme.palette.error.main },
                                }}
                            >
                                {error}
                            </Alert>
                        )}

                        <GradientButton
                            type="submit"
                            fullWidth
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? (
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <CircularProgress size={20} sx={{ color: theme.palette.text.primary, mr: 1 }} />
                                    Đang đăng nhập...
                                </Box>
                            ) : (
                                'Đăng Nhập'
                            )}
                        </GradientButton>

                        <GoogleButton
                            fullWidth
                            disabled={loading}
                            onClick={handleGoogleLogin}
                            sx={{ mb: 2 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Chrome size={18} style={{ marginRight: '8px', color: theme.palette.primary.main }} />
                                Đăng nhập bằng Google
                            </Box>
                        </GoogleButton>

                        <Divider sx={{ my: 2, opacity: 0.3, bgcolor: theme.palette.divider }} />

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="body2"
                                sx={{ color: theme.palette.text.secondary, mb: 1, fontSize: '14px' }}
                            >
                                Chưa có tài khoản?
                                <Button
                                    onClick={handleRegisterClick}
                                    variant="text"
                                    sx={{
                                        color: theme.palette.primary.main,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        fontSize: '14px',
                                        padding: '8px 16px',
                                        borderRadius: theme.shape.borderRadius,
                                        '&:hover': { backgroundColor: `${theme.palette.primary.main}10`, transform: 'translateY(-1px)' },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    Đăng ký
                                </Button>
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </DialogContent>
        </StyledDialog>
    );
}