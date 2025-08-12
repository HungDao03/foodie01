import React, { useEffect, useState } from 'react';
import {
    TextField, Button, Box, Typography, Alert, CircularProgress, Paper,
    InputAdornment, Collapse, List, ListItem, ListItemText,
    IconButton, Divider, Skeleton, Chip, Stack
} from '@mui/material';
import {
    Add as AddIcon, Category as CategoryIcon, Delete as DeleteIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import CategoryService from "../../../service/categoryService.js";

const CategoriesManager = () => {
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
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, px: 2 }}>
            {/* Header */}
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    Quản lý danh mục
                </Typography>
                <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={fetchCategories}
                    disabled={fetchLoading}
                >
                    Làm mới
                </Button>
            </Stack>

            {/* Form thêm */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="primary.main">
                    <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Thêm danh mục mới
                </Typography>

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
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <CategoryIcon color={error ? 'error' : 'action'} />
                            </InputAdornment>
                        )
                    }}
                />

                <Collapse in={!!success} timeout={300}>
                    <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>
                </Collapse>

                <Collapse in={!!error && !loading} timeout={300}>
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                </Collapse>

                <Button
                    variant="contained"
                    fullWidth
                    disabled={!isValid || loading}
                    onClick={handleAddCategory}
                    startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                    sx={{ mt: 2, py: 1.5 }}
                >
                    {loading ? 'Đang thêm...' : 'Thêm danh mục'}
                </Button>
            </Paper>

            {/* Danh sách */}
            <Paper elevation={2} sx={{ borderRadius: 3 }}>
                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h6" color="primary.main">
                            Danh sách danh mục
                        </Typography>
                        <Chip
                            label={`${categories.length} danh mục`}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    </Stack>
                </Box>

                <List sx={{ pb: 0 }}>
                    {fetchLoading ? (
                        Array.from({ length: 3 }).map((_, index) => (
                            <ListItem key={index}>
                                <Skeleton variant="text" width="60%" height={40} />
                                <Skeleton variant="circular" width={40} height={40} sx={{ ml: 'auto' }} />
                            </ListItem>
                        ))
                    ) : categories.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="Chưa có danh mục nào"
                                secondary="Thêm danh mục đầu tiên của bạn ở trên"
                                sx={{ textAlign: 'center', py: 4 }}
                            />
                        </ListItem>
                    ) : (
                        categories.map((cat, index) => (
                            <React.Fragment key={cat.id}>
                                <ListItem
                                    sx={{
                                        py: 2,
                                        '&:hover': {
                                            backgroundColor: 'action.hover',
                                            transition: 'background-color 0.2s'
                                        }
                                    }}
                                    secondaryAction={
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleDelete(cat.id)}
                                            disabled={deleteLoading.has(cat.id)}
                                            color="error"
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
                                            fontWeight: 'medium',
                                            noWrap: true
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
    );
};

export default CategoriesManager;
