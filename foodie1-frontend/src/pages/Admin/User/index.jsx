import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    CircularProgress,
    Typography,
    TablePagination,
    Avatar,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
    IconButton,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Skeleton,
    Alert,
    Snackbar,
    Badge,
    TableSortLabel,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Fab,
    useTheme
} from '@mui/material';
import {
    Visibility,
    Delete,
    Add,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    Close,
    Search,
    Clear,
    Security,
    Block,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserService from "../../../service/userService.js";

const UserManagementPage = () => {
    const theme = useTheme();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleteUserId, setDeleteUserId] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('username');
    const [sortOrder, setSortOrder] = useState('asc');
    const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        newToday: 0
    });
    const [actionLoading, setActionLoading] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await UserService.getAllUsers();
            const userData = response.data;
            setUsers(userData);

            const roleUserData = userData.filter(user => user.roles?.includes('ROLE_USER'));
            const today = new Date().toDateString();
            const stats = {
                total: roleUserData.length,
                verified: roleUserData.filter(u => u.verified).length,
                unverified: roleUserData.filter(u => !u.verified).length,
                newToday: roleUserData.filter(u =>
                    u.createdAt && new Date(u.createdAt).toDateString() === today
                ).length
            };
            setStats(stats);
        } catch (error) {
            showSnackbar('Không thể tải danh sách người dùng: ' + (error.response?.data || error.message), 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleVerified = async (userId) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        try {
            await UserService.toggleVerified(userId);
            toast.success('Cập nhật trạng thái tài khoản thanh cong!');
            fetchUsers();
        } catch (error) {
            toast.error('Cập nhật trạng thái tài khoản không thành cong: ' + (error.response?.data || error.message));
        } finally {
            setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    const deleteUser = async () => {
        if (!deleteUserId) return;

        setActionLoading(prev => ({ ...prev, [deleteUserId]: true }));
        try {
            await UserService.deleteUser(deleteUserId);
            showSnackbar('Xóa người dùng thành công!', 'success');
            fetchUsers();
            setShowDeleteDialog(false);
            setDeleteUserId(null);
        } catch (error) {
            showSnackbar('Lỗi khi xóa người dùng: ' + (error.response?.data || error.message), 'error');
        } finally {
            setActionLoading(prev => ({ ...prev, [deleteUserId]: false }));
        }
    };

    const sendEmail = async (userId, email) => {
        try {
            await UserService.sendNotification(userId);
            showSnackbar(`Đã gửi email đến ${email}`, 'success');
        } catch (error) {
            showSnackbar('Lỗi khi gửi email: ' + (error.response?.data || error.message), 'error');
        }
    };

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleSort = (field) => {
        const isAsc = sortBy === field && sortOrder === 'asc';
        setSortOrder(isAsc ? 'desc' : 'asc');
        setSortBy(field);
    };

    const filteredAndSortedUsers = useMemo(() => {
        return users
            .filter((user) => user.roles?.includes('ROLE_USER'))
            .filter((user) => {
                const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    user.phoneNumber?.includes(searchTerm);

                const matchesFilter = filterStatus === 'all' ||
                    (filterStatus === 'verified' && user.verified) ||
                    (filterStatus === 'unverified' && !user.verified);

                return matchesSearch && matchesFilter;
            })
            .sort((a, b) => {
                const aValue = a[sortBy] || '';
                const bValue = b[sortBy] || '';

                if (sortOrder === 'asc') {
                    return aValue.toString().localeCompare(bValue.toString());
                } else {
                    return bValue.toString().localeCompare(aValue.toString());
                }
            });
    }, [users, searchTerm, filterStatus, sortBy, sortOrder]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const TableSkeleton = () => (
        <>
            {[...Array(rowsPerPage)].map((_, index) => (
                <TableRow key={index}>
                    <TableCell><Skeleton variant="circular" width={40} height={40} /></TableCell>
                    <TableCell><Skeleton variant="text" width="80%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="90%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="70%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="60%" /></TableCell>
                    <TableCell><Skeleton variant="text" width="85%" /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={80} height={24} /></TableCell>
                    <TableCell><Skeleton variant="rectangular" width={100} height={32} /></TableCell>
                </TableRow>
            ))}
        </>
    );

    const getCardStyle = (mode) => ({
        background: mode === 'dark' ? 'rgba(29, 29, 29, 0.95)' : 'rgba(255,255,255,0.95)',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(20px)',
        border: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer'
    });

    const getHoverEffects = (e, mode, isEnter) => {
        if (isEnter) {
            e.currentTarget.style.transform = 'translateY(-12px) scale(1.03)';
            e.currentTarget.style.boxShadow = mode === 'dark' ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px rgba(0,0,0,0.15)';
        } else {
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = mode === 'dark' ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)';
        }
    };

    return (
        <Box sx={{
            p: 4,
            maxWidth: '1400px',
            mx: 'auto',
            background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #121212 0%, #1d1d1d 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            minHeight: '100vh',
            color: theme.palette.text.primary
        }}>
            {/* Header Section */}
            <div style={{
                marginBottom: "40px",
                textAlign: 'center',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    top: -50,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(118, 75, 162, 0.2) 0%, rgba(102, 126, 234, 0.2) 100%)'
                        : 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    filter: 'blur(40px)',
                    zIndex: -1
                }} />

                <h1 style={{
                    fontSize: "3.5rem",
                    fontWeight: "900",
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: "0 0 16px 0",
                    textShadow: theme.palette.mode === 'dark'
                        ? '0 4px 8px rgba(255,255,255,0.1)'
                        : '0 4px 8px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.02em'
                }}>
                    👥 Quản lý Tài khoản
                </h1>
                <p style={{
                    color: theme.palette.text.secondary,
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    opacity: 0.8,
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Quản lý và theo dõi tất cả tài khoản người dùng trong hệ thống
                </p>

                {/* Decorative Elements */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '16px',
                    marginTop: '24px'
                }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            opacity: 0.6,
                            animation: `pulse ${2 + i * 0.5}s infinite`
                        }} />
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                {/* Total Users Card */}
                <div
                    style={getCardStyle(theme.palette.mode)}
                    onMouseEnter={(e) => getHoverEffects(e, theme.palette.mode, true)}
                    onMouseLeave={(e) => getHoverEffects(e, theme.palette.mode, false)}
                >
                    <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(102, 126, 234, 0.2)'
                            : 'rgba(102, 126, 234, 0.1)',
                        opacity: 0.3,
                        transition: 'all 0.4s ease'
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 3 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                marginBottom: "12px",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                opacity: 0.8
                            }}>
                                Tổng số người dùng
                            </div>
                            <div style={{
                                fontSize: "2.5rem",
                                fontWeight: "800",
                                color: theme.palette.primary.main,
                                marginBottom: "12px",
                                textShadow: theme.palette.mode === 'dark'
                                    ? '0 2px 4px rgba(102, 126, 234, 0.3)'
                                    : '0 2px 4px rgba(102, 126, 234, 0.2)'
                            }}>
                                {stats.total}
                            </div>
                        </div>
                        <div style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "20px",
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "28px",
                            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)'
                        }}>
                            👥
                        </div>
                    </div>
                </div>

                {/* Verified Users Card */}
                <div
                    style={getCardStyle(theme.palette.mode)}
                    onMouseEnter={(e) => getHoverEffects(e, theme.palette.mode, true)}
                    onMouseLeave={(e) => getHoverEffects(e, theme.palette.mode, false)}
                >
                    <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(76, 175, 80, 0.2)'
                            : 'rgba(76, 175, 80, 0.1)',
                        opacity: 0.3,
                        transition: 'all 0.4s ease'
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 3 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                marginBottom: "12px",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                opacity: 0.8
                            }}>
                                Đã xác minh
                            </div>
                            <div style={{
                                fontSize: "2.5rem",
                                fontWeight: "800",
                                color: '#4CAF50',
                                marginBottom: "12px",
                                textShadow: theme.palette.mode === 'dark'
                                    ? '0 2px 4px rgba(76, 175, 80, 0.3)'
                                    : '0 2px 4px rgba(76, 175, 80, 0.2)'
                            }}>
                                {stats.verified}
                            </div>
                        </div>
                        <div style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "20px",
                            background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "28px",
                            boxShadow: '0 8px 32px rgba(76, 175, 80, 0.4)'
                        }}>
                            ✅
                        </div>
                    </div>
                </div>

                {/* Unverified Users Card */}
                <div
                    style={getCardStyle(theme.palette.mode)}
                    onMouseEnter={(e) => getHoverEffects(e, theme.palette.mode, true)}
                    onMouseLeave={(e) => getHoverEffects(e, theme.palette.mode, false)}
                >
                    <div style={{
                        position: 'absolute',
                        top: -20,
                        right: -20,
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: theme.palette.mode === 'dark'
                            ? 'rgba(255, 152, 0, 0.2)'
                            : 'rgba(255, 152, 0, 0.1)',
                        opacity: 0.3,
                        transition: 'all 0.4s ease'
                    }} />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: 'relative', zIndex: 3 }}>
                        <div style={{ flex: 1 }}>
                            <div style={{
                                color: theme.palette.text.secondary,
                                fontSize: "0.875rem",
                                fontWeight: 600,
                                marginBottom: "12px",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                opacity: 0.8
                            }}>
                                Chưa xác minh
                            </div>
                            <div style={{
                                fontSize: "2.5rem",
                                fontWeight: "800",
                                color: '#FF9800',
                                marginBottom: "12px",
                                textShadow: theme.palette.mode === 'dark'
                                    ? '0 2px 4px rgba(255, 152, 0, 0.3)'
                                    : '0 2px 4px rgba(255, 152, 0, 0.2)'
                            }}>
                                {stats.unverified}
                            </div>
                        </div>
                        <div style={{
                            width: "72px",
                            height: "72px",
                            borderRadius: "20px",
                            background: 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)',
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#fff",
                            fontSize: "28px",
                            boxShadow: '0 8px 32px rgba(255, 152, 0, 0.4)'
                        }}>
                            ⚠️
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div style={{
                background: theme.palette.mode === 'dark'
                    ? 'rgba(29, 29, 29, 0.95)'
                    : 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(0,0,0,0.3)'
                    : '0 8px 32px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(20px)',
                border: theme.palette.mode === 'dark'
                    ? '1px solid rgba(255,255,255,0.1)'
                    : '1px solid rgba(255,255,255,0.2)',
                position: 'relative'
            }}>
                <div style={{
                    position: 'absolute',
                    bottom: -100,
                    left: -100,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
                    filter: 'blur(60px)',
                    zIndex: 0
                }} />

                <TableContainer component="div" sx={{ position: 'relative', zIndex: 1 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                '& th': {
                                    color: 'white',
                                    fontWeight: 700,
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    border: 'none',
                                    padding: '20px 16px'
                                }
                            }}>
                                <TableCell>👤 Avatar</TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'username'}
                                        direction={sortBy === 'username' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('username')}
                                        sx={{ color: 'white', '&.Mui-active': { color: 'white' } }}
                                    >
                                        🔑 Tên đăng nhập
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'email'}
                                        direction={sortBy === 'email' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('email')}
                                        sx={{ color: 'white', '&.Mui-active': { color: 'white' } }}
                                    >
                                        📧 Email
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>
                                    <TableSortLabel
                                        active={sortBy === 'fullName'}
                                        direction={sortBy === 'fullName' ? sortOrder : 'asc'}
                                        onClick={() => handleSort('fullName')}
                                        sx={{ color: 'white', '&.Mui-active': { color: 'white' } }}
                                    >
                                        👨‍💼 Họ tên
                                    </TableSortLabel>
                                </TableCell>
                                <TableCell>📞 Liên hệ</TableCell>
                                <TableCell>📊 Trạng thái</TableCell>
                                <TableCell sx={{ textAlign: 'center' }}>⚙️ Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableSkeleton />
                            ) : filteredAndSortedUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                                        <Typography variant="body1" color="text.secondary">
                                            Không tìm thấy người dùng nào
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAndSortedUsers
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user) => (
                                        <TableRow key={user.id} hover>
                                            <TableCell>
                                                <Badge
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                    badgeContent={
                                                        user.verified ?
                                                            <CheckCircle color="success" sx={{ fontSize: 16 }} /> :
                                                            <Warning color="warning" sx={{ fontSize: 16 }} />
                                                    }
                                                >
                                                    <Avatar
                                                        src={
                                                            user.avatar
                                                                ? `${import.meta.env.VITE_API_BASE_URL_GG}uploads/avatar/${user.avatar}`
                                                                : '/images/default-avatar.png'
                                                        }
                                                        alt={user.username}
                                                        sx={{ width: 50, height: 50 }}
                                                    />
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {user.username}
                                                    </Typography>
                                                    {user.createdAt && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            Tham gia: {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Email sx={{ fontSize: 16, color: 'text.secondary' }} />
                                                    <Typography variant="body2">
                                                        {user.email}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2" fontWeight="medium">
                                                    {user.fullName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                    {user.phoneNumber && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Phone sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography variant="caption">
                                                                {user.phoneNumber}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {user.address && (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <LocationOn sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    maxWidth: 150,
                                                                    overflow: 'hidden',
                                                                    textOverflow: 'ellipsis',
                                                                    whiteSpace: 'nowrap'
                                                                }}
                                                            >
                                                                {user.address}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={user.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                                    color={user.verified ? 'success' : 'warning'}
                                                    size="small"
                                                    icon={user.verified ? <CheckCircle /> : <Warning />}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                    <Tooltip title="Xem chi tiết">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                setShowUserDialog(true);
                                                            }}
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Tooltip title={user.verified ? "Vô hiệu hóa" : "Kích hoạt"}>
                            <span>
                              <IconButton
                                  size="small"
                                  onClick={() => toggleVerified(user.id)}
                                  disabled={actionLoading[user.id]}
                                  color={user.verified ? 'error' : 'success'}
                              >
                                {actionLoading[user.id] ? (
                                    <CircularProgress size={16} />
                                ) : user.verified ? (
                                    <Block fontSize="small" />
                                ) : (
                                    <CheckCircle fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>

            {/* User Detail Dialog */}
            <Dialog
                open={showUserDialog}
                onClose={() => setShowUserDialog(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Chi tiết người dùng
                        <IconButton onClick={() => setShowUserDialog(false)}>
                            <Close />
                        </IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    {selectedUser && (
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                                <Avatar
                                    src={
                                        selectedUser.avatar
                                            ? `${import.meta.env.VITE_API_BASE_URL_GG}uploads/avatar/${selectedUser.avatar}`
                                            : '/images/default-avatar.png'
                                    }
                                    alt={selectedUser.username}
                                    sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                                />
                                <Typography variant="h6" gutterBottom>
                                    {selectedUser.fullName || selectedUser.username}
                                </Typography>
                                <Chip
                                    label={selectedUser.verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                    color={selectedUser.verified ? 'success' : 'warning'}
                                    sx={{ mb: 2 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <List>
                                    <ListItem>
                                        <ListItemIcon><Security /></ListItemIcon>
                                        <ListItemText
                                            primary="Tên đăng nhập"
                                            secondary={selectedUser.username}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon><Email /></ListItemIcon>
                                        <ListItemText
                                            primary="Email"
                                            secondary={selectedUser.email}
                                        />
                                    </ListItem>
                                    {selectedUser.phoneNumber && (
                                        <ListItem>
                                            <ListItemIcon><Phone /></ListItemIcon>
                                            <ListItemText
                                                primary="Số điện thoại"
                                                secondary={selectedUser.phoneNumber}
                                            />
                                        </ListItem>
                                    )}
                                    {selectedUser.address && (
                                        <ListItem>
                                            <ListItemIcon><LocationOn /></ListItemIcon>
                                            <ListItemText
                                                primary="Địa chỉ"
                                                secondary={selectedUser.address}
                                            />
                                        </ListItem>
                                    )}
                                    {selectedUser.createdAt && (
                                        <ListItem>
                                            <ListItemIcon><CalendarToday /></ListItemIcon>
                                            <ListItemText
                                                primary="Ngày tham gia"
                                                secondary={new Date(selectedUser.createdAt).toLocaleString('vi-VN')}
                                            />
                                        </ListItem>
                                    )}
                                    <ListItem>
                                        <ListItemIcon><Security /></ListItemIcon>
                                        <ListItemText
                                            primary="Vai trò"
                                            secondary={selectedUser.roles?.join(', ') || 'N/A'}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowUserDialog(false)}>
                        Đóng
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<Email />}
                        onClick={() => selectedUser && sendEmail(selectedUser.id, selectedUser.email)}
                    >
                        Gửi Email
                    </Button>
                    <Button
                        variant="contained"
                        color={selectedUser?.verified ? 'error' : 'success'}
                        onClick={() => {
                            if (selectedUser) {
                                toggleVerified(selectedUser.id);
                                setShowUserDialog(false);
                            }
                        }}
                    >
                        {selectedUser?.verified ? 'Vô hiệu hóa' : 'Kích hoạt'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Floating Action Button for mobile */}
            <Fab
                color="primary"
                aria-label="add user"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', md: 'none' },
                    background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                        background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(135deg, #8a5bb8 0%, #7a8ff0 100%)'
                            : 'linear-gradient(135deg, #7a8ff0 0%, #8a5bb8 100%)',
                        transform: 'scale(1.1)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onClick={() => {/* TODO: Add new user */}}
            >
                <Add />
            </Fab>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

            {/* CSS Animations */}
            <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(1); opacity: 0.7; }
        }
      `}</style>
        </Box>
    );
};

export default UserManagementPage;