import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
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
    Card,
    CardContent,
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
    Divider,
    TableSortLabel,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Fab,
    Menu
} from '@mui/material';
import {
    Visibility,
    Edit,
    Delete,
    Refresh,
    Add,
    FilterList,
    Download,
    Upload,
    PersonAdd,
    Email,
    Phone,
    LocationOn,
    CalendarToday,
    MoreVert,
    Close,
    Search,
    Clear,
    Security,
    Block,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import {  ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserService from "../../../service/userService.js";

const UserManagementPage = () => {

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
    const [sortOrder, setSortOrder] = useState('asc');const [stats, setStats] = useState({
        total: 0,
        verified: 0,
        unverified: 0,
        newToday: 0
    });
    const [actionLoading, setActionLoading] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedUserForMenu, setSelectedUserForMenu] = useState(null);


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
            showSnackbar('Cập nhật trạng thái tài khoản thành công!', 'success');
            fetchUsers();
        } catch (error) {
            showSnackbar('Lỗi khi cập nhật: ' + (error.response?.data || error.message), 'error');
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

    const handleMenuOpen = (event, user) => {
        setAnchorEl(event.currentTarget);
        setSelectedUserForMenu(user);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedUserForMenu(null);
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

    // Loading skeleton
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

    return (
        <Box sx={{ p: 3, maxWidth: '1400px', mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    Quản lý Tài khoản
                </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                                {stats.total}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Tổng số người dùng
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                                {stats.verified}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Đã xác minh
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                                {stats.unverified}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Chưa xác minh
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                                {stats.newToday}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Mới hôm nay
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Search and Filters */}
            <Card sx={{ mb: 3, p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Tìm kiếm người dùng"
                            variant="outlined"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />,
                                endAdornment: searchTerm && (
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <Clear />
                                    </IconButton>
                                )
                            }}
                            placeholder="Tìm theo tên, email, họ tên hoặc số điện thoại"
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                label="Trạng thái"
                            >
                                <MenuItem value="all">Tất cả</MenuItem>
                                <MenuItem value="verified">Đã xác minh</MenuItem>
                                <MenuItem value="unverified">Chưa xác minh</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                </Grid>

            </Card>

            {/* Results Info */}
            {!loading && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Hiển thị {Math.min(page * rowsPerPage + 1, filteredAndSortedUsers.length)} - {Math.min((page + 1) * rowsPerPage, filteredAndSortedUsers.length)}
                        {' '}trong tổng số {filteredAndSortedUsers.length} người dùng
                    </Typography>
                    <TablePagination
                        component="div"
                        count={filteredAndSortedUsers.length}
                        page={page}
                        onPageChange={(event, newPage) => setPage(newPage)}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={(event) => {
                            setRowsPerPage(parseInt(event.target.value, 10));
                            setPage(0);
                        }}
                        labelRowsPerPage="Số dòng mỗi trang:"
                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
                    />
                </Box>
            )}

            {/* Table */}
            <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Avatar</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={sortBy === 'username'}
                                    direction={sortBy === 'username' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('username')}
                                >
                                    Tên đăng nhập
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={sortBy === 'email'}
                                    direction={sortBy === 'email' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('email')}
                                >
                                    Email
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>
                                <TableSortLabel
                                    active={sortBy === 'fullName'}
                                    direction={sortBy === 'fullName' ? sortOrder : 'asc'}
                                    onClick={() => handleSort('fullName')}
                                >
                                    Họ tên
                                </TableSortLabel>
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Liên hệ</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trạng thái</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Thao tác</TableCell>
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
                                                            ? `http://localhost:8080/uploads/avatar/${user.avatar}`
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

                                                <Tooltip title="Thêm thao tác">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleMenuOpen(e, user)}
                                                    >
                                                        <MoreVert fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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
                                            ? `http://localhost:8080/uploads/avatar/${selectedUser.avatar}`
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

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Warning color="warning" />
                        Xác nhận xóa người dùng
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowDeleteDialog(false)}>
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={deleteUser}
                        disabled={actionLoading[deleteUserId]}
                        startIcon={actionLoading[deleteUserId] ? <CircularProgress size={20} /> : <Delete />}
                    >
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Action Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => {
                    if (selectedUserForMenu) {
                        setSelectedUser(selectedUserForMenu);
                        setShowUserDialog(true);
                        handleMenuClose();
                    }
                }}>
                    <ListItemIcon><Visibility fontSize="small" /></ListItemIcon>
                    <ListItemText>Xem chi tiết</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    if (selectedUserForMenu) {
                        sendEmail(selectedUserForMenu.id, selectedUserForMenu.email);
                        handleMenuClose();
                    }
                }}>
                    <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                    <ListItemText>Gửi email</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => {
                    handleMenuClose();
                }}>

                </MenuItem>
                <Divider />
                <MenuItem
                    onClick={() => {
                        if (selectedUserForMenu) {
                            setDeleteUserId(selectedUserForMenu.id);
                            setShowDeleteDialog(true);
                            handleMenuClose();
                        }
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <ListItemIcon><Delete fontSize="small" color="error" /></ListItemIcon>
                    <ListItemText>Xóa người dùng</ListItemText>
                </MenuItem>
            </Menu>

            {/* Floating Action Button for mobile */}
            <Fab
                color="primary"
                aria-label="add user"
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    display: { xs: 'flex', md: 'none' }
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
        </Box>
    );
};

export default UserManagementPage;