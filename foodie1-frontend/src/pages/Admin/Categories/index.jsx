import React, { useEffect, useState } from 'react';
import {
    TextField, Button, Box, Typography, Alert, CircularProgress, Paper,
    InputAdornment, Collapse, List, ListItem, ListItemText,
    IconButton, Divider, Skeleton, Chip, Stack, useTheme
} from '@mui/material';
import {
    Add as AddIcon, Category as CategoryIcon, Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CategoryService from "../../../service/categoryService.js";

const CategoriesManager = () => {
    const theme = useTheme();
    const [name, setName] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(new Set());

    const fetchCategories = async () => {
        try {
            setFetchLoading(true);
            const res = await CategoryService.getAllCategories();
            setCategories(res.data);
        } catch (err) {
            toast.error('Lỗi khi tải danh mục');
        } finally {
            setFetchLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const validateForm = () => {
        const trimmed = name.trim();
        if (!trimmed) return setError('Tên danh mục không được để trống'), false;
        if (trimmed.length < 2) return setError('Ít nhất 2 ký tự'), false;
        if (trimmed.length > 50) return setError('Không quá 50 ký tự'), false;
        return true;
    };

    const clearMessages = () => setTimeout(() => {
        setError('');
        setSuccess('');
    }, 3000);

    const handleAddCategory = async () => {
        setError('');
        setSuccess('');
        if (!validateForm()) return clearMessages();

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await CategoryService.createCategory(
                { name: name.trim() },
                token
            );
            toast.success('Thêm danh mục thành công!');
            setSuccess('Đã thêm danh mục');
            setCategories(prev => [...prev, res.data]);
            setName('');
        } catch (err) {
            const code = err.response?.status;
            const serverMessage = err.response?.data?.message;

            let message = 'Thêm danh mục thất bại';
            if (err.message === 'Network Error') {
                message = 'Không thể kết nối';
            } else if (serverMessage) {
                message = serverMessage;
            } else if (code === 400) {
                message = 'Dữ liệu không hợp lệ';
            } else if (code === 401) {
                message = 'Không có quyền';
            } else if (code === 409) {
                message = 'Danh mục đã tồn tại';
            }

            toast.error(message);
            setError(message);
        } finally {
            setLoading(false);
            clearMessages();
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;

        setDeleteLoading(prev => new Set([...prev, id]));

        try {
            const token = localStorage.getItem('token');
            await CategoryService.deleteCategory(id, token);
            toast.success('Đã xóa danh mục');
            setCategories(prev => prev.filter(cat => cat.id !== id));
        } catch (err) {
            const message =
                err.response?.data?.message === 'Không thể xóa danh mục đang được sử dụng.'
                    ? 'Không thể xóa: Danh mục đang được sử dụng trong món ăn hoặc giỏ hàng.'
                    : err.response?.data?.message || 'Xóa danh mục thất bại';
            toast.error(message);
        } finally {
            setDeleteLoading(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };

    const isValid = name.trim().length >= 2 && name.trim().length <= 50;

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && isValid && !loading) {
            handleAddCategory();
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                padding: '32px 24px',
                position: 'relative',
                overflow: 'hidden',
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary
            }}
        >
            <Box
                sx={{
                    maxWidth: 1200,
                    margin: '0 auto',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* Header Section */}
                <Box sx={{ 
                    marginBottom: "40px",
                    textAlign: 'center',
                    position: 'relative'
                }}>
                    <Typography
                        variant="h1"
                        sx={{ 
                            fontSize: "3.5rem", 
                            fontWeight: "900", 
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: "0 0 16px 0",
                            textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        🏷️ Quản lý danh mục
                    </Typography>
                </Box>

                {/* Form thêm */}
                <Paper
                    elevation={3}
                    sx={{
                        padding: '32px',
                        marginBottom: '32px',
                        borderRadius: '24px',
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                        }}
                    />
                    
                    <Box sx={{
                        textAlign: 'center',
                        marginBottom: '24px'
                    }}>
                        <Box sx={{
                            fontSize: '2rem',
                            marginBottom: '8px'
                        }}>🏷️</Box>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: '1.75rem',
                                fontWeight: '700',
                                color: theme.palette.primary.main,
                                margin: '0 0 8px 0'
                            }}
                        >
                            Thêm danh mục mới
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                color: theme.palette.text.secondary,
                                fontSize: '1rem',
                                margin: 0
                            }}
                        >
                            Tạo danh mục mới để tổ chức món ăn
                        </Typography>
                    </Box>

                    <TextField
                        label="Tên danh mục"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                        margin="normal"
                        disabled={loading}
                        error={!!error}
                        helperText={error || `${name.length}/50 ký tự`}
                        onKeyDown={handleKeyDown}
                        autoComplete="off"
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: '16px',
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: theme.palette.primary.main,
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <CategoryIcon color={error ? 'error' : 'primary'} />
                                </InputAdornment>
                            )
                        }}
                    />

                    <Collapse in={!!success} timeout={300}>
                        <Alert severity="success" sx={{ mb: 2, borderRadius: '12px' }}>{success}</Alert>
                    </Collapse>

                    <Collapse in={!!error && !loading} timeout={300}>
                        <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>{error}</Alert>
                    </Collapse>

                    <Box sx={{
                        textAlign: 'center',
                        marginTop: '24px'
                    }}>
                        <Button
                            variant="contained"
                            disabled={!isValid || loading}
                            onClick={handleAddCategory}
                            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                            sx={{
                                py: 2,
                                px: 4,
                                borderRadius: '28px',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 12px 40px ${theme.palette.primary.main}60`
                                },
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            {loading ? 'Đang thêm...' : '➕ Thêm danh mục'}
                        </Button>
                    </Box>
                </Paper>

                {/* Danh sách */}
                <Paper
                    elevation={3}
                    sx={{
                        borderRadius: '24px',
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: `linear-gradient(90deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`
                        }}
                    />
                    
                    <Box sx={{
                        padding: '24px',
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.action.hover
                    }}>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <Typography
                                    variant="h3"
                                    sx={{
                                        fontSize: '1.5rem',
                                        fontWeight: '700',
                                        color: theme.palette.success.main,
                                        margin: 0
                                    }}
                                >
                                    📋 Danh sách danh mục
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon />}
                                    onClick={fetchCategories}
                                    disabled={fetchLoading}
                                    sx={{
                                        borderRadius: '20px',
                                        borderColor: theme.palette.success.main,
                                        color: theme.palette.success.main,
                                        '&:hover': {
                                            borderColor: theme.palette.success.dark,
                                            backgroundColor: theme.palette.success.light + '20'
                                        }
                                    }}
                                >
                                    Làm mới
                                </Button>
                            </Box>
                            <Chip
                                label={`${categories.length} danh mục`}
                                sx={{
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark || theme.palette.success.main} 100%)`,
                                    color: 'white',
                                    fontWeight: '600',
                                    borderRadius: '16px'
                                }}
                            />
                        </Box>
                    </Box>

                    <List sx={{ pb: 0 }}>
                        {fetchLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <ListItem key={index} sx={{ py: 2 }}>
                                    <Skeleton variant="text" width="60%" height={40} />
                                    <Skeleton variant="circular" width={40} height={40} sx={{ ml: 'auto' }} />
                                </ListItem>
                            ))
                        ) : categories.length === 0 ? (
                            <ListItem sx={{ py: 6 }}>
                                <Box sx={{
                                    textAlign: 'center',
                                    width: '100%'
                                }}>
                                    <Box sx={{
                                        width: 120,
                                        height: 120,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.action.hover,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px auto',
                                        border: `2px solid ${theme.palette.divider}`
                                    }}>
                                        <Box sx={{ 
                                            fontSize: '3rem',
                                            opacity: 0.6
                                        }}>📁</Box>
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            fontSize: '1.25rem',
                                            fontWeight: '600',
                                            color: theme.palette.text.primary,
                                            marginBottom: '8px'
                                        }}
                                    >
                                        Chưa có danh mục nào
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: theme.palette.text.secondary,
                                            fontSize: '1rem'
                                        }}
                                    >
                                        Thêm danh mục đầu tiên của bạn ở trên
                                    </Typography>
                                </Box>
                            </ListItem>
                        ) : (
                            categories.map((cat, index) => (
                                <React.Fragment key={cat.id}>
                                    <ListItem
                                        sx={{
                                            py: 3,
                                            px: 3,
                                            '&:hover': {
                                                backgroundColor: theme.palette.action.hover,
                                                transition: 'background-color 0.2s'
                                            }
                                        }}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDelete(cat.id)}
                                                disabled={deleteLoading.has(cat.id)}
                                                sx={{
                                                    color: theme.palette.error.main,
                                                    '&:hover': {
                                                        backgroundColor: theme.palette.error.light + '20'
                                                    }
                                                }}
                                            >
                                                {deleteLoading.has(cat.id) ? (
                                                    <CircularProgress size={20} />
                                                ) : (
                                                    <DeleteIcon />
                                                )}
                                            </IconButton>
                                        }
                                    >
                                        <ListItemText
                                            primary={cat.name}
                                            primaryTypographyProps={{
                                                fontWeight: '600',
                                                fontSize: '1.1rem',
                                                color: theme.palette.text.primary
                                            }}
                                        />
                                    </ListItem>
                                    {index < categories.length - 1 && <Divider />}
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>
            </Box>
        </Box>
    );
};

export default CategoriesManager;
