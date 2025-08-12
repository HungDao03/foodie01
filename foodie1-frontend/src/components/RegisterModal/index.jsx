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
    Stepper,
    Step,
    StepLabel,
    CircularProgress,
    Alert,
    Fade
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
    X,
    User,
    Lock,
    Eye,
    EyeOff,
    Mail,
    Phone,
    MapPin,
    ArrowRight,
    ArrowLeft,
    UserPlus,
    Check
} from 'lucide-react';
import axios from 'axios';
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
        maxWidth: '500px',
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

const StepButton = styled(Button)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 1.5,
    padding: theme.spacing(1.5, 3),
    fontSize: '14px',
    fontWeight: 600,
    textTransform: 'none',
    '&.next-button': {
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.text.primary,
        '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            transform: 'translateY(-2px)',
        },
    },
    '&.back-button': {
        backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f3f4f6',
        color: theme.palette.text.secondary,
        '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? '#333333' : '#e5e7eb',
        },
    },
    transition: 'all 0.3s ease',
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

const steps = ['Thông tin cơ bản', 'Thông tin liên hệ', 'Xác nhận'];

export default function RegisterModal({ open, onClose, onLoginClick }) {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        fullName: '',
        phoneNumber: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const theme = useTheme();
    const { isDarkMode } = useThemeStore();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateStep = (step) => {
        const errors = {};
        switch (step) {
            case 0:
                if (!formData.username.trim()) errors.username = 'Tên đăng nhập là bắt buộc';
                if (!formData.password.trim()) errors.password = 'Mật khẩu là bắt buộc';
                if (formData.password.length < 6) errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
                if (!formData.fullName.trim()) errors.fullName = 'Họ và tên là bắt buộc';
                break;
            case 1:
                if (!formData.email.trim()) errors.email = 'Email là bắt buộc';
                if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email không hợp lệ';
                if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Số điện thoại là bắt buộc';
                if (!/^\d+$/.test(formData.phoneNumber)) errors.phoneNumber = 'Số điện thoại chỉ được chứa số';
                if (formData.phoneNumber.length < 9 || formData.phoneNumber.length > 10) errors.phoneNumber = 'Số điện thoại phải từ 9 đến 10 số';
                if (!formData.address.trim()) errors.address = 'Địa chỉ là bắt buộc';
                break;
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const handleClose = () => {
        setActiveStep(0);
        setFormData({
            username: '', password: '', email: '',
            fullName: '', phoneNumber: '', address: ''
        });
        setValidationErrors({});
        setError('');
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setValidationErrors({});

        try {
            await authService.register(formData);
            toast.success('Đăng ký thành công! Vui lòng kiểm tra email.', {
                position: "top-right",
                autoClose: 3000,
                theme: isDarkMode ? 'dark' : 'light'
            });
            handleClose();
            if (onLoginClick) onLoginClick();
        } catch (err) {
            if (err.response?.status === 400 && typeof err.response.data === 'object') {
                setValidationErrors(err.response.data);
                // Xác định step chứa lỗi và chuyển về step đó
                const errorFields = Object.keys(err.response.data);
                if (errorFields.length > 0) {
                    // Các trường ở step 0
                    const step0Fields = ['username', 'password', 'fullName'];
                    // Các trường ở step 1
                    const step1Fields = ['email', 'phoneNumber', 'address'];
                    let targetStep = activeStep;
                    if (errorFields.some(f => step0Fields.includes(f))) {
                        targetStep = 0;
                    } else if (errorFields.some(f => step1Fields.includes(f))) {
                        targetStep = 1;
                    }
                    if (targetStep !== activeStep) {
                        setActiveStep(targetStep);
                        // Focus vào ô đầu tiên có lỗi ở step đó
                        setTimeout(() => {
                            const firstError = errorFields.find(f => (targetStep === 0 ? step0Fields : step1Fields).includes(f));
                            const el = document.querySelector(`[name="${firstError}"]`);
                            if (el) el.focus();
                        }, 100);
                    } else {
                        // Nếu đang ở đúng step, focus vào ô lỗi
                        const firstError = errorFields[0];
                        const el = document.querySelector(`[name="${firstError}"]`);
                        if (el) el.focus();
                    }
                }
            } else {
                const errorMessage = err.response?.data?.message || 'Có lỗi xảy ra khi đăng ký.';
                setError(errorMessage);
                toast.error(errorMessage, {
                    position: "top-right",
                    autoClose: 3000,
                    theme: isDarkMode ? 'dark' : 'light'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Fade in>
                        <Box>
                            <StyledTextField
                                fullWidth required autoFocus
                                label="Họ và tên" name="fullName"
                                value={formData.fullName} onChange={handleChange}
                                error={!!validationErrors.fullName} helperText={validationErrors.fullName}
                                InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} style={{ color: theme.palette.primary.main }} /></InputAdornment> }}
                            />
                            <StyledTextField
                                fullWidth required
                                label="Tên đăng nhập" name="username"
                                value={formData.username} onChange={handleChange}
                                error={!!validationErrors.username} helperText={validationErrors.username}
                                InputProps={{ startAdornment: <InputAdornment position="start"><User size={18} style={{ color: theme.palette.primary.main }} /></InputAdornment> }}
                            />
                            <StyledTextField
                                fullWidth required
                                label="Mật khẩu" name="password" type={showPassword ? 'text' : 'password'}
                                value={formData.password} onChange={handleChange}
                                error={!!validationErrors.password} helperText={validationErrors.password}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><Lock size={18} style={{ color: theme.palette.primary.main }} /></InputAdornment>,
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: theme.palette.primary.main, '&:hover': { backgroundColor: `${theme.palette.primary.main}10` } }}>
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Box>
                    </Fade>
                );
            case 1:
                return (
                    <Fade in>
                        <Box>
                            <StyledTextField
                                fullWidth required
                                label="Email" name="email" type="email"
                                value={formData.email} onChange={handleChange}
                                error={!!validationErrors.email} helperText={validationErrors.email}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={18} style={{ color: theme.palette.primary.main }} /></InputAdornment> }}
                            />
                            <StyledTextField
                                fullWidth required
                                label="Số điện thoại" name="phoneNumber"
                                value={formData.phoneNumber} onChange={handleChange}
                                error={!!validationErrors.phoneNumber} helperText={validationErrors.phoneNumber}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={18} style={{ color: theme.palette.primary.main }} /></InputAdornment> }}
                            />
                            <StyledTextField
                                fullWidth required
                                label="Địa chỉ" name="address"
                                value={formData.address} onChange={handleChange}
                                error={!!validationErrors.address} helperText={validationErrors.address}
                                InputProps={{ startAdornment: <InputAdornment position="start"><MapPin size={18} style={{ color: theme.palette.primary.main }} /></InputAdornment> }}
                            />
                        </Box>
                    </Fade>
                );
            case 2:
                return (
                    <Fade in>
                        <Box sx={{ textAlign: 'left', p: 2, backgroundColor: theme.palette.mode === 'dark' ? '#2a2a2a' : '#f5f7fa', borderRadius: theme.shape.borderRadius * 1.5 }}>
                            <Typography variant="h6" sx={{ color: theme.palette.text.primary }} gutterBottom>Xác nhận thông tin</Typography>
                            <Typography sx={{ color: theme.palette.text.primary }}><strong>Họ và tên:</strong> {formData.fullName}</Typography>
                            <Typography sx={{ color: theme.palette.text.primary }}><strong>Tên đăng nhập:</strong> {formData.username}</Typography>
                            <Typography sx={{ color: theme.palette.text.primary }}><strong>Email:</strong> {formData.email}</Typography>
                            <Typography sx={{ color: theme.palette.text.primary }}><strong>Số điện thoại:</strong> {formData.phoneNumber}</Typography>
                            <Typography sx={{ color: theme.palette.text.primary }}><strong>Địa chỉ:</strong> {formData.address}</Typography>
                        </Box>
                    </Fade>
                );
            default:
                return 'Unknown step';
        }
    };

    return (
        <StyledDialog open={open} onClose={handleClose} TransitionComponent={Fade} transitionDuration={300}>
            <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                <GradientHeader>
                    <CloseButton onClick={handleClose}>
                        <X size={20} />
                    </CloseButton>
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
                        Tạo tài khoản
                    </Typography>
                    <Typography sx={{ opacity: 0.8, color: theme.palette.text.primary }}>
                        Tham gia và khám phá ẩm thực
                    </Typography>
                </GradientHeader>

                <Box sx={{ p: 3 }}>
                    <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3, '& .MuiStepLabel-label': { color: theme.palette.text.primary } }}>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 2,
                                borderRadius: theme.shape.borderRadius,
                                backgroundColor: `${theme.palette.error.main}10`,
                                border: `1px solid ${theme.palette.error.main}20`,
                                '& .MuiAlert-message': { color: theme.palette.error.main },
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        {renderStepContent(activeStep)}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <StepButton
                                className="back-button"
                                disabled={activeStep === 0 || loading}
                                onClick={handleBack}
                                startIcon={<ArrowLeft />}
                            >
                                Quay lại
                            </StepButton>
                            {activeStep === steps.length - 1 ? (
                                <StepButton
                                    className="next-button"
                                    type="submit"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Check />}
                                >
                                    {loading ? 'Đang xử lý...' : 'Hoàn tất'}
                                </StepButton>
                            ) : (
                                <StepButton
                                    className="next-button"
                                    onClick={handleNext}
                                    endIcon={<ArrowRight />}
                                >
                                    Tiếp theo
                                </StepButton>
                            )}
                        </Box>
                    </form>
                    <Typography align="center" sx={{ mt: 2, color: theme.palette.text.secondary, fontSize: '14px' }}>
                        Đã có tài khoản?{' '}
                        <Button
                            variant="text"
                            onClick={() => {
                                handleClose();
                                onLoginClick();
                            }}
                            sx={{
                                textTransform: 'none',
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                '&:hover': { backgroundColor: `${theme.palette.primary.main}10` },
                            }}
                        >
                            Đăng nhập ngay
                        </Button>
                    </Typography>
                </Box>
            </DialogContent>
        </StyledDialog>
    );
}