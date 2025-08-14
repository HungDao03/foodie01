import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Avatar,
    Button,
    Stack,
    TextField,
    Alert,
    Snackbar,
    CircularProgress,
    Tooltip,
    Fade,
    Zoom, InputLabel, FormControl, Select, MenuItem,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from 'react-router-dom';
import UserService from '../../service/userService.js';


// Constants
const AVATAR_SIZE = 150;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Field configurations
const FORM_FIELDS = [
    { key: 'full_name', label: 'Họ và tên', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone_number', label: 'Số điện thoại', type: 'tel' },
    { key: 'address', label: 'Địa chỉ', type: 'text', multiline: true, rows: 2 },
];

// Enhanced styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
        : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 50%, #ffffff 100%)',
    border: `1px solid ${theme.palette.primary.main}20`,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: theme.palette.mode === 'dark'
        ? `0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px ${theme.palette.primary.main}10`
        : `0 8px 32px ${theme.palette.primary.main}15, 0 0 0 1px ${theme.palette.primary.main}05`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
        opacity: 0.6,
    },
    '&:hover': {
        boxShadow: theme.palette.mode === 'dark'
            ? `0 12px 48px rgba(0,0,0,0.6), 0 0 0 1px ${theme.palette.primary.main}20`
            : `0 12px 48px ${theme.palette.primary.main}20, 0 0 0 1px ${theme.palette.primary.main}10`,
        transform: 'translateY(-2px)',
    },
}));
const AvatarContainer = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'isEditing',
})(({ isEditing }) => ({
    position: 'relative',
    display: 'inline-block',
    '&::after': isEditing ? {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.4)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.3s ease',
        cursor: 'pointer',
    } : {},
    '&:hover::after': isEditing ? {
        opacity: 1,
    } : {},
}));

const StyledAvatar = styled(Avatar, {
    shouldForwardProp: (prop) => prop !== 'isEditing'
})(({ theme, isEditing }) => ({
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    margin: '0 auto 16px',
    cursor: isEditing ? 'pointer' : 'default',
    borderRadius: '50%',
    boxShadow: `0 8px 24px ${theme.palette.primary.main}20`,
    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
    border: `3px solid ${theme.palette.primary.main}`,
    position: 'relative',
    '&:hover': isEditing ? {
        boxShadow: `0 12px 40px ${theme.palette.primary.main}30`,
        transform: 'scale(1.05)',
        borderColor: theme.palette.primary.dark,
    } : {},
}));

const CameraIconOverlay = styled(Box)(() => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    color: 'white',
    fontSize: '2rem',
    opacity: 0,
    transition: 'opacity 0.3s ease',
    pointerEvents: 'none',
    zIndex: 1,
}));

const StyledButton = styled(Button)(({ theme, variant = 'primary' }) => {
    const getGradient = () => {
        switch (variant) {
            case 'cancel':
                return theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                    : 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)';
            default:
                return theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)';
        }
    };

    return {
        background: getGradient(),
        fontWeight: 700,
        borderRadius: theme.shape.borderRadius * 2,
        padding: theme.spacing(1.5, 4),
        boxShadow: `0 4px 16px ${theme.palette.primary.main}20`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        textTransform: 'none',
        fontSize: '1rem',
        '&:hover': {
            boxShadow: `0 8px 24px ${theme.palette.primary.main}30`,
            transform: 'translateY(-2px) scale(1.02)',
        },
        '&:active': {
            transform: 'translateY(0) scale(0.98)',
        },
        '&:disabled': {
            opacity: 0.6,
            transform: 'none',
        },
    };
});

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: theme.shape.borderRadius * 2,
        background: theme.palette.mode === 'dark'
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(0,0,0,0.02)',
        fontWeight: 500,
        color: theme.palette.text.primary,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '& fieldset': {
            borderColor: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.1)',
            borderWidth: '2px',
        },
        '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
        },
        '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
        },
        '&.Mui-focused': {
            background: theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(0,0,0,0.04)',
        },
    },
    '& .MuiInputLabel-root': {
        color: theme.palette.text.secondary,
        fontWeight: 600,
        '&.Mui-focused': {
            color: theme.palette.primary.main,
        },
    },
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    marginBottom: theme.spacing(4),
    fontWeight: 800,
    background: theme.palette.mode === 'dark'
        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
        : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: `0 2px 8px ${theme.palette.primary.main}10`,
    position: 'relative',
    '&::after': {
        content: '""',
        position: 'absolute',
        bottom: '-8px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '60px',
        height: '3px',
        background: theme.palette.primary.main,
        borderRadius: '2px',
    },
}));

function Account() {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [userData, setUserData] = useState({
        full_name: '',
        email: '',
        phone_number: '',
        address: '',
        avatar: '',
        username: '',
        paymentMethod: 'COD', // mặc định hoặc load từ backend
    });
    const [tempAvatar, setTempAvatar] = useState('');
    const [originalData, setOriginalData] = useState({});
    const navigate = useNavigate();
    const theme = useTheme();
// Check if data has changed
    const hasChanges = useMemo(() => {
        return Object.keys(userData).some(key =>
            userData[key] !== originalData[key]
        ) || tempAvatar !== userData.avatar;
    }, [userData, originalData, tempAvatar]);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const userStorage = localStorage.getItem('user');
            const user = userStorage ? JSON.parse(userStorage) : null;

            if (!user?.token) {
                navigate('');
                return;
            }

            try {
                setIsLoading(true);
                const response = await UserService.getUserProfile();
                const data = response.data;

                const formattedData = {
                    full_name: data.fullName || '',
                    email: data.email || '',
                    phone_number: data.phoneNumber || '',
                    address: data.address || '',
                    avatar: data.avatar || '',
                    username: data.username || '',
                    paymentMethod: data.paymentMethod || 'COD',
                };

                setUserData(formattedData);
                setOriginalData(formattedData);
                setTempAvatar(data.avatar || '');
                setError(null);
            } catch (err) {
                setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
                console.error('Error fetching user profile:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    // Memoized avatar URL generation
    const avatarUrl = useMemo(() => {
        const avatarPath = isEditing ? tempAvatar : userData.avatar;
        if (!avatarPath) return 'https://placehold.co/150/png?text=Avatar';
        if (avatarPath.startsWith('http')) return avatarPath;

        const cleanPath = avatarPath.replace(/^\/?uploads\/?/, '').replace(/^avatar\//, '');
        return `${import.meta.env.VITE_API_BASE_URL_GG}uploads/avatar/${cleanPath}`;
    }, [isEditing, tempAvatar, userData.avatar]);

    // Handlers
    const handleEdit = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setUserData(originalData);
        setTempAvatar(originalData.avatar);
        setError(null);
        setSuccessMessage('');
    }, [originalData]);

    const handleSave = useCallback(async () => {
        if (!hasChanges) {
            setIsEditing(false);
            return;
        }

        try {
            setIsLoading(true);
            const dataToSend = {
                fullName: userData.full_name,
                email: userData.email,
                phoneNumber: userData.phone_number,
                address: userData.address,
                username: userData.username,
                avatar: tempAvatar,
                paymentMethod: userData.paymentMethod,
            };

            const response = await UserService.updateUserProfile(dataToSend);
            const updatedUser = response.data;

            const formattedData = {
                full_name: updatedUser.fullName || '',
                email: updatedUser.email || '',
                phone_number: updatedUser.phoneNumber || '',
                address: updatedUser.address || '',
                avatar: updatedUser.avatar || '',
                username: updatedUser.username || '',
                paymentMethod: updatedUser.paymentMethod || ''
            };

            setUserData(formattedData);
            setOriginalData(formattedData);
            setTempAvatar(updatedUser.avatar || '');

            // Update localStorage
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({
                ...user,
                avatar: updatedUser.avatar
            }));

            setIsEditing(false);
            setSuccessMessage('Cập nhật thông tin thành công!');
            setError(null);
        } catch (err) {
            setError('Không thể cập nhật thông tin. Vui lòng thử lại sau.');
            console.error('Error updating profile:', err);
        } finally {
            setIsLoading(false);
        }
    }, [userData, tempAvatar, hasChanges]);

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value,
        }));
    }, []);

    const handleAvatarChange = useCallback(async (event) => {
        const file = event.target.files?.[0];
        if (!file || !isEditing) return;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            setError('Kích thước file không được vượt quá 5MB');
            return;
        }

        // Validate file type
        if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            setError('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)');
            return;
        }

        try {
            setIsLoading(true);
            const { data: avatarUrl } = await UserService.uploadAvatar(file);
            setTempAvatar(avatarUrl);
            setSuccessMessage('Tải ảnh mới thành công! Nhấn "Lưu" để áp dụng.');
            setError(null);
        } catch (err) {
            setError('Không thể tải ảnh. Vui lòng thử lại sau.');
            console.error('Error uploading avatar:', err);
        } finally {
            setIsLoading(false);
        }

        // Reset input
        event.target.value = '';
    }, [isEditing]);

    const handleCloseSnackbar = useCallback(() => {
        setError(null);
        setSuccessMessage('');
    }, []);

    // Loading state
    if (isLoading && !userData.full_name) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{ color: theme.palette.primary.main }}
                />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4, bgcolor: 'background.default' }}>
            <Snackbar
                open={!!error || !!successMessage}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                TransitionComponent={Fade}
            >
                <Alert
                    severity={error ? 'error' : 'success'}
                    sx={{
                        width: '100%',
                        borderRadius: theme.shape.borderRadius * 2,
                        fontWeight: 600,
                        bgcolor: error ? theme.palette.error.light : theme.palette.success.light,
                        color: theme.palette.text.primary,
                        boxShadow: `0 8px 24px ${theme.palette.primary.main}20`,
                    }}
                    onClose={handleCloseSnackbar}
                >
                    {error || successMessage}
                </Alert>
            </Snackbar>

            <Fade in timeout={600}>
                <Box>
                    <PageTitle variant="h4" align="center">
                        Tài khoản của tôi
                    </PageTitle>

                    <Zoom in timeout={800}>
                        <StyledPaper>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                spacing={4}
                                alignItems="flex-start"
                            >
                                {/* Avatar Section */}
                                <Box sx={{ textAlign: 'center', minWidth: { md: 200 } }}>
                                    <input
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        id="avatar-upload"
                                        type="file"
                                        onChange={handleAvatarChange}
                                        disabled={!isEditing || isLoading}
                                    />
                                    <label htmlFor="avatar-upload">
                                        <AvatarContainer isEditing={isEditing}>
                                            <Tooltip
                                                title={isEditing ? "Nhấn để thay đổi ảnh đại diện" : "Ảnh đại diện"}
                                                placement="top"
                                            >
                                                <StyledAvatar
                                                    src={avatarUrl}
                                                    isEditing={isEditing}
                                                    imgProps={{
                                                        onError: (e) => {
                                                            e.target.src = 'https://placehold.co/150/png?text=Avatar';
                                                        },
                                                    }}
                                                />
                                            </Tooltip>
                                            {isEditing && (
                                                <CameraIconOverlay>
                                                    <PhotoCameraIcon fontSize="large" />
                                                </CameraIconOverlay>
                                            )}
                                        </AvatarContainer>
                                    </label>

                                    {isEditing && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 1,
                                                display: 'block',
                                                color: theme.palette.text.secondary,
                                                fontStyle: 'italic'
                                            }}
                                        >
                                            Nhấn vào ảnh để thay đổi
                                        </Typography>
                                    )}
                                </Box>

                                {/* Form Section */}
                                <Box sx={{ flex: 1 }}>
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        mb={4}
                                        flexWrap="wrap"
                                        gap={2}
                                    >
                                        <Typography
                                            variant="h5"
                                            sx={{
                                                fontWeight: 700,
                                                color: theme.palette.primary.main,
                                                background: theme.palette.mode === 'dark'
                                                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                                    : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}
                                        >
                                            Thông tin cá nhân
                                        </Typography>

                                        <Stack direction="row" spacing={2}>
                                            {isEditing && (
                                                <StyledButton
                                                    variant="outlined"
                                                    startIcon={<CancelIcon />}
                                                    onClick={handleCancel}
                                                    disabled={isLoading}
                                                    sx={{
                                                        background: 'transparent',
                                                        border: `2px solid ${theme.palette.error.main}`,
                                                        color: theme.palette.error.main,
                                                        '&:hover': {
                                                            background: theme.palette.error.main,
                                                            color: 'white',
                                                        }
                                                    }}
                                                >
                                                    Hủy
                                                </StyledButton>
                                            )}

                                            <StyledButton
                                                variant="contained"
                                                startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
                                                onClick={isEditing ? handleSave : handleEdit}
                                                disabled={isLoading || (isEditing && !hasChanges)}
                                            >
                                                {isLoading ? (
                                                    <CircularProgress size={24} color="inherit" />
                                                ) : (
                                                    isEditing ? 'Lưu thay đổi' : 'Chỉnh sửa'
                                                )}
                                            </StyledButton>
                                        </Stack>
                                    </Stack>

                                    <Stack spacing={3}>
                                        {FORM_FIELDS.map((field) => (
                                            <Fade in key={field.key} timeout={400}>
                                                <StyledTextField
                                                    label={field.label}
                                                    name={field.key}
                                                    type={field.type}
                                                    value={userData[field.key]}
                                                    onChange={handleChange}
                                                    disabled={!isEditing || isLoading}
                                                    fullWidth
                                                    multiline={field.multiline}
                                                    rows={field.rows}
                                                    variant="outlined"
                                                    InputProps={{
                                                        sx: {
                                                            transition: 'all 0.3s ease',
                                                        }
                                                    }}
                                                />
                                            </Fade>
                                        ))}
                                    </Stack>

                                    <Fade in timeout={400}>
                                        <FormControl fullWidth disabled={!isEditing || isLoading}>
                                            <InputLabel id="payment-method-label">Phương thức thanh toán</InputLabel>
                                            <Select
                                                labelId="payment-method-label"
                                                name="paymentMethod"
                                                value={userData.paymentMethod || ''}
                                                label="Phương thức thanh toán"
                                                onChange={handleChange}
                                            >
                                                <MenuItem value="COD">Thanh toán khi nhận hàng (COD)</MenuItem>
                                                <MenuItem value="ONLINE">Thanh toán trực tuyến (ONLINE)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Fade>
                                </Box>
                            </Stack>
                        </StyledPaper>
                    </Zoom>
                </Box>
            </Fade>
        </Container>
    );
}

export default Account;