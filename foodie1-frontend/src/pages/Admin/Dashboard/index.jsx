import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
    Users, Package, ShoppingCart, DollarSign, TrendingUp, TrendingDown,
    Clock, CheckCircle, XCircle, AlertCircle
} from "lucide-react";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import UserService from "../../../service/userService.js";
import FoodItemsService from "../../../service/food-itemsService.js";
import OrderService from "../../../service/orderService.js";

const Dashboard = () => {
    const theme = useTheme();

    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentOrders, setRecentOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [stats, setStats] = useState([
        {
            label: "Người dùng",
            value: "0",
            icon: Users,
            color: "#1976d2",
            trend: "+12%",
            bgColor: "#e3f2fd"
        },
        {
            label: "Món ăn",
            value: "0",
            icon: Package,
            color: "#388e3c",
            trend: "+3%",
            bgColor: "#e8f5e8"
        },
        {
            label: "Đơn hàng hôm nay",
            value: "0",
            icon: ShoppingCart,
            color: "#f57c00",
            trend: "+18%",
            bgColor: "#fff3e0"
        },
        {
            label: "Doanh thu hôm nay",
            value: "0₫",
            icon: DollarSign,
            color: "#7b1fa2",
            trend: "-5%",
            bgColor: "#f3e5f5"
        },
    ]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const responses = await Promise.all([
                    UserService.getAllUsers(),
                    FoodItemsService.getAllFoods(),
                    OrderService.getTotalOrders(),
                    OrderService.getWeeklyRevenueStats(),
                    OrderService.getTodayRevenue(),
                    OrderService.getOrdersToday()
                ]);

                // Gán lại tên biến cho rõ ràng
                const [userRes, foodRes, totalOrdersRes, weeklyStatsRes, todayRevenueRes, todayOrdersRes] = responses;

                setStats((prev) => {
                    const updated = [...prev];
                    // Xử lý dữ liệu người dùng
                    updated[0].value = (userRes?.data?.length || 0).toLocaleString();
                    // Xử lý dữ liệu món ăn
                    updated[1].value = (foodRes?.data?.length || 0).toLocaleString();
                    // Xử lý đơn hàng hôm nay
                    updated[2].value = (totalOrdersRes?.data?.totalOrdersToday || 0).toLocaleString();
                    // Xử lý doanh thu hôm nay
                    const revenue = todayRevenueRes?.data?.todayRevenue || 0;
                    updated[3].value = formatCurrency(revenue);
                    return updated;
                });

                const dayMap = {
                    "Thứ 2": "T2", "Thứ 3": "T3", "Thứ 4": "T4",
                    "Thứ 5": "T5", "Thứ 6": "T6", "Thứ 7": "T7", "Chủ nhật": "CN"
                };
                const orderedDays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
                // Lấy dữ liệu từ response, kiểm tra nếu response.data là mảng thì lấy trực tiếp, nếu không thì thử lấy response.data.data hoặc trả về mảng rỗng
                const rawData = Array.isArray(weeklyStatsRes?.data) 
                    ? weeklyStatsRes.data 
                    : weeklyStatsRes?.data?.data || [];

                // Đảm bảo rawData là mảng trước khi sử dụng map
                const chart = Array.isArray(rawData) 
                    ? orderedDays.map(day => {
                        const item = rawData.find(d => d && d.day === day) || { day, totalRevenue: 0 };
                        return {
                            name: dayMap[day] || day,
                            revenue: item && typeof item.totalRevenue !== 'undefined' ? item.totalRevenue : 0
                        };
                    })
                    : [];

                // Đảm bảo chartData luôn là mảng
                const safeChartData = Array.isArray(chart) ? chart : [];
                setChartData(safeChartData);

                // Xử lý dữ liệu đơn hàng gần đây
                const orders = Array.isArray(todayOrdersRes?.data) 
                    ? todayOrdersRes.data 
                    : todayOrdersRes?.data?.data 
                        ? Array.isArray(todayOrdersRes.data.data) 
                            ? todayOrdersRes.data.data 
                            : []
                        : [];
                
                // Đảm bảo mỗi đơn hàng đều có thuộc tính items là mảng
                const safeOrders = orders.map(order => ({
                    ...order,
                    items: Array.isArray(order.items) ? order.items : []
                }));
                
                setRecentOrders(safeOrders);

            } catch (err) {
                // Đặt giá trị mặc định cho tất cả state
                setChartData([]);
                setRecentOrders([]);
                setStats(prev => prev.map(stat => ({
                    ...stat,
                    value: stat.label.includes('Doanh thu') ? '0₫' : '0'
                })));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatCurrency = (amount) => {
        if (amount >= 1_000_000) return (amount / 1_000_000).toFixed(1) + " triệu ₫";
        return amount.toLocaleString("vi-VN") + "₫";
    };

    const getStatusConfig = (status) => {
        const configs = {
            'pending': { icon: Clock, color: '#f57c00', bg: '#fff3e0', text: 'Chờ xử lý' },
            'confirmed': { icon: CheckCircle, color: '#388e3c', bg: '#e8f5e8', text: 'Đã xác nhận' },
            'CONFIRMED': { icon: CheckCircle, color: '#388e3c', bg: '#e8f5e8', text: 'Đã xác nhận' },
            'preparing': { icon: AlertCircle, color: '#1976d2', bg: '#e3f2fd', text: 'Đang chuẩn bị' },
            'delivering': { icon: TrendingUp, color: '#7b1fa2', bg: '#f3e5f5', text: 'Đang giao' },
            'DELIVERING': { icon: TrendingUp, color: '#7b1fa2', bg: '#f3e5f5', text: 'Đang giao hàng' },
            'completed': { icon: CheckCircle, color: '#388e3c', bg: '#e8f5e8', text: 'Hoàn thành' },
            'DELIVERED': { icon: CheckCircle, color: '#388e3c', bg: '#e8f5e8', text: 'Đã giao hàng' },
            'cancelled': { icon: XCircle, color: '#d32f2f', bg: '#ffebee', text: 'Đã hủy' },
            'CANCELLED': { icon: XCircle, color: '#d32f2f', bg: '#ffebee', text: 'Đã hủy' }
        };
        return configs[status] || configs['pending'];
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        return date.toLocaleDateString('vi-VN');
    };

    const styles = {
        container: {
            p: 3,
            background: theme.palette.background.default,
            minHeight: '100vh'
        },
        paper: {
            background: theme.palette.background.paper,
            borderRadius: 4,
            overflow: 'hidden',
            border: `1px solid ${theme.palette.divider}`
        },
        grid: {
            display: "grid",
            gap: "24px",
            marginBottom: "24px"
        },
        gridCols4: {
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))"
        },
        gridCols2: {
            gridTemplateColumns: "2fr 1fr"
        },
        statCard: {
            padding: "24px",
            cursor: "pointer",
            transition: "all 0.3s ease",
            position: 'relative',
            overflow: 'hidden'
        },
        statCardHover: {
            transform: "translateY(-4px)",
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
        },
        avatar: {
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "24px",
            position: 'relative',
            zIndex: 2
        }
    };

    const StatCard = ({ item }) => {
        // Kiểm tra item có tồn tại và là object không
        if (!item || typeof item !== 'object') {
            console.warn('StatCard: item không hợp lệ');
            return null;
        }
        
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const [isHovered, setIsHovered] = useState(false);
        const IconComponent = item.icon || (() => null);
        const trendText = item.trend || "";
        const isNegative = typeof trendText === 'string' && trendText.includes("-");
        const trendColor = isNegative ? theme.palette.error.main : theme.palette.success.main;
        const TrendIcon = isNegative ? TrendingDown : TrendingUp;

        return (
            <div
                style={{
                    ...styles.paper,
                    ...styles.statCard,
                    background: `linear-gradient(135deg, ${item.bgColor} 0%, ${item.bgColor}dd 100%)`,
                    border: `2px solid ${item.color}20`,
                    ...(isHovered ? styles.statCardHover : {})
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Background Pattern */}
                <div style={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `${item.color}10`,
                    opacity: isHovered ? 0.3 : 0.1,
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
                            {item.label}
                        </div>
                        <div style={{ 
                            fontSize: "2.5rem", 
                            fontWeight: "800", 
                            color: item.color, 
                            marginBottom: "12px",
                            textShadow: `0 2px 4px ${item.color}20`
                        }}>
                            {item.value}
                        </div>
                        <div style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "8px",
                            padding: "8px 16px",
                            borderRadius: "20px",
                            background: `${trendColor}15`,
                            border: `1px solid ${trendColor}30`,
                            width: 'fit-content'
                        }}>
                            <TrendIcon size={18} color={trendColor} />
                            <span style={{ 
                                color: trendColor, 
                                fontWeight: 700, 
                                fontSize: "0.875rem",
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {item.trend}
                            </span>
                        </div>
                    </div>
                    <div style={{
                        ...styles.avatar,
                        background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                        boxShadow: `0 8px 32px ${item.color}40`,
                        transform: isHovered ? 'rotate(5deg) scale(1.1)' : 'rotate(0deg) scale(1)',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}>
                        <IconComponent size={32} />
                    </div>
                </div>
            </div>
        );
    };

    // Sửa lại OrderItem: click sẽ mở modal, hiển thị trạng thái, tên món, tổng tiền
    const OrderItem = ({ order }) => {
        // Kiểm tra order có tồn tại và là object không
        if (!order || typeof order !== 'object') {
            console.warn('Order không hợp lệ:', order);
            return null;
        }
        
        const statusConfig = getStatusConfig(order.status || 'pending');
        const StatusIcon = statusConfig?.icon || AlertCircle;
        let foodNames = "";
        let totalItems = 0;
        
        if (Array.isArray(order.items) && order.items.length > 0) {
            foodNames = order.items
                .map(item => item?.foodName || item?.foodItemName || "")
                .filter(Boolean)
                .join(", ") || "Không có món ăn";
            totalItems = order.items.reduce((sum, item) => sum + (item?.quantity || 0), 0);
        } else if (order.foodItemName) {
            foodNames = order.foodItemName;
            totalItems = order.quantity || 1;
        } else if (order.foodName) {
            foodNames = order.foodName;
            totalItems = order.quantity || 1;
        } else {
            foodNames = "Không có thông tin món ăn";
            totalItems = 0;
        }

        return (
            <div
                style={{
                    padding: "16px",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    transition: "background-color 0.2s",
                    cursor: "pointer"
                }}
                onClick={() => setSelectedOrder(order)}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                #{order.id || order.orderCode}
                            </span>
                            <div style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                padding: "2px 8px",
                                borderRadius: "12px",
                                backgroundColor: statusConfig.bg,
                                border: `1px solid ${statusConfig.color}20`
                            }}>
                                <StatusIcon size={12} color={statusConfig.color} />
                                <span style={{ fontSize: "0.75rem", color: statusConfig.color, fontWeight: 500 }}>
                                    {statusConfig.text}
                                </span>
                            </div>
                            {totalItems > 1 && (
                                <div style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    padding: "2px 8px",
                                    borderRadius: "12px",
                                    backgroundColor: theme.palette.secondary.main + "20",
                                    border: `1px solid ${theme.palette.secondary.main}40`,
                                    fontSize: "0.75rem",
                                    color: theme.palette.secondary.main,
                                    fontWeight: 500
                                }}>
                                    {totalItems} món
                                </div>
                            )}
                        </div>
                        <div style={{ fontSize: "0.875rem", color: theme.palette.text.secondary, marginBottom: "4px" }}>
                            {foodNames || "Không có món ăn"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: theme.palette.text.secondary, marginBottom: "4px" }}>
                            {formatTime(order.createdAt || order.orderTime)}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                            {order.deliveryAddress ? `📍 ${order.deliveryAddress.substring(0, 50)}${order.deliveryAddress.length > 50 ? '...' : ''}` : 'Không có địa chỉ'}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, color: theme.palette.text.primary, marginBottom: "4px" }}>
                            {formatCurrency(order.totalAmount || order.total)}
                        </div>
                        <div style={{ 
                            fontSize: "0.75rem", 
                            color: order.paymentStatus === 'PAID' ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 500
                        }}>
                            {order.paymentStatus === 'PAID' ? '✅ Đã TT' : '❌ Chưa TT'}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ ...styles.container, display: "flex", justifyContent: "center", alignItems: "center" }}>
                <CircularProgress size={60} />
            </div>
        );
    }

    // Đảm bảo chartData luôn là mảng trước khi render
    const safeChartData = Array.isArray(chartData) ? chartData : [];
    const safeRecentOrders = Array.isArray(recentOrders) ? recentOrders : [];
    const safeStats = Array.isArray(stats) ? stats : [];

    return (
        <div style={styles.container}>
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
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
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
                    textShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    letterSpacing: '-0.02em'
                }}>
                    Dashboard Quản trị
                </h1>
                <p style={{ 
                    color: theme.palette.text.secondary, 
                    fontSize: "1.25rem",
                    fontWeight: 500,
                    opacity: 0.8,
                    maxWidth: '600px',
                    margin: '0 auto'
                }}>
                    Chào mừng trở lại! Đây là tổng quan về hoạt động hệ thống.
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
            <div style={{ ...styles.grid, ...styles.gridCols4 }}>
                {safeStats.map((item, index) => (
                    <StatCard key={index} item={item} />
                ))}
            </div>

            <div style={{ ...styles.grid, ...styles.gridCols2 }}>
                {/* Chart Section */}
                <div style={{ ...styles.paper, padding: "32px", position: 'relative', overflow: 'hidden' }}>
                    {/* Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: -100,
                        right: -100,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
                        filter: 'blur(60px)',
                        zIndex: 0
                    }} />
                    
                    <div style={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        alignItems: "center", 
                        marginBottom: "32px",
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <div>
                            <h2 style={{ 
                                fontSize: "1.75rem", 
                                fontWeight: "800", 
                                color: theme.palette.text.primary, 
                                marginBottom: 8,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                📊 Doanh thu tuần
                            </h2>
                            <p style={{ 
                                color: theme.palette.text.secondary, 
                                fontSize: "1rem",
                                fontWeight: 500,
                                opacity: 0.8
                            }}>
                                7 ngày qua
                            </p>
                        </div>
                        <div style={{
                            padding: '12px 20px',
                            borderRadius: '20px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <div style={{ 
                                color: '#667eea', 
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                fontSize: '0.875rem'
                            }}>
                                Tổng quan
                            </div>
                        </div>
                    </div>
                    <div style={{ height: "320px", position: 'relative', zIndex: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={safeChartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="rgba(102, 126, 234, 0.1)" 
                                    opacity={0.5}
                                />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ 
                                        fontSize: 14, 
                                        fill: theme.palette.text.secondary,
                                        fontWeight: 600
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ 
                                        fontSize: 12, 
                                        fill: theme.palette.text.secondary,
                                        fontWeight: 500
                                    }}
                                    tickFormatter={(value) => `${(value / 1000).toLocaleString("vi-VN")}k`}
                                />
                                <Tooltip
                                    formatter={(value) => `${value.toLocaleString("vi-VN")}₫`}
                                    contentStyle={{
                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                        borderRadius: "16px",
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                                        color: theme.palette.text.primary,
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(255,255,255,0.2)'
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#colorRevenue)"
                                    radius={[8, 8, 0, 0]}
                                    barSize={50}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Orders Section */}
                <div style={{ ...styles.paper, padding: "32px", position: 'relative', overflow: 'hidden' }}>
                    {/* Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        bottom: -100,
                        left: -100,
                        width: 200,
                        height: 200,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
                        filter: 'blur(60px)',
                        zIndex: 0
                    }} />
                    
                    <div style={{ 
                        marginBottom: "32px",
                        position: 'relative',
                        zIndex: 1
                    }}>
                        <h2 style={{ 
                            fontSize: "1.75rem", 
                            fontWeight: "800", 
                            color: theme.palette.text.primary, 
                            marginBottom: 8,
                            background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent'
                        }}>
                            🛒 Đơn hàng gần đây
                        </h2>
                        <div style={{ 
                            color: theme.palette.text.secondary, 
                            fontSize: "1rem",
                            fontWeight: 500,
                            opacity: 0.8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
                                animation: 'pulse 2s infinite'
                            }} />
                            {recentOrders.length} đơn hàng mới nhất - Click để xem chi tiết
                        </div>
                    </div>
                    <div style={{
                        height: "320px",
                        overflowY: "auto",
                        border: `2px solid rgba(76, 175, 80, 0.1)`,
                        borderRadius: "16px",
                        background: 'rgba(76, 175, 80, 0.02)',
                        position: 'relative',
                        zIndex: 1
                    }}>
                        {safeRecentOrders.length > 0 ? (
                            safeRecentOrders.map((order, index) => (
                                <OrderItem key={order?.id || index} order={order} />
                            ))
                        ) : (
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                color: theme.palette.text.secondary,
                                padding: '40px'
                            }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.1) 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <ShoppingCart size={48} style={{ opacity: 0.6 }} />
                                </div>
                                <div style={{ 
                                    fontSize: '1.25rem',
                                    fontWeight: 600,
                                    marginBottom: '8px',
                                    color: theme.palette.text.primary
                                }}>
                                    Chưa có đơn hàng nào
                                </div>
                                <div style={{ 
                                    fontSize: '0.875rem',
                                    opacity: 0.7, 
                                    textAlign: 'center',
                                    color: theme.palette.text.secondary
                                }}>
                                    Các đơn hàng sẽ hiển thị ở đây khi khách hàng đặt hàng
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal chi tiết đơn hàng */}
            {selectedOrder && (
                <div style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.3)",
                    zIndex: 9999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                }}
                     onClick={() => setSelectedOrder(null)}
                >
                    <div
                        style={{
                            background: theme.palette.background.paper,
                            borderRadius: "16px",
                            boxShadow: theme.shadows[5],
                            padding: "32px",
                            minWidth: "500px",
                            maxWidth: "90vw",
                            maxHeight: "90vh",
                            overflowY: "auto",
                            position: "relative"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            style={{
                                position: "absolute",
                                top: 16,
                                right: 16,
                                background: "none",
                                border: "none",
                                fontSize: 24,
                                cursor: "pointer",
                                color: theme.palette.text.secondary
                            }}
                            onClick={() => setSelectedOrder(null)}
                        >×</button>
                        
                        {/* Header */}
                        <div style={{ marginBottom: 24 }}>
                            <h2 style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: 8 }}>
                                Đơn hàng #{selectedOrder.id || selectedOrder.orderCode}
                            </h2>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                    Trạng thái:
                                </span>
                                <span style={{
                                    padding: "6px 16px",
                                    borderRadius: "20px",
                                    background: getStatusConfig(selectedOrder.status).bg,
                                    color: getStatusConfig(selectedOrder.status).color,
                                    fontWeight: 600,
                                    fontSize: "0.875rem"
                                }}>
                                    {getStatusConfig(selectedOrder.status).text}
                                </span>
                            </div>
                        </div>

                        {/* Thông tin cơ bản */}
                        <div style={{ 
                            display: "grid", 
                            gridTemplateColumns: "1fr 1fr", 
                            gap: 16, 
                            marginBottom: 24,
                            padding: "16px",
                            background: theme.palette.action.hover,
                            borderRadius: "12px"
                        }}>
                            <div>
                                <span style={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: "0.875rem" }}>
                                    Thời gian đặt hàng:
                                </span>
                                <div style={{ fontWeight: 500, marginTop: 4 }}>
                                    {selectedOrder.orderTime ? new Date(selectedOrder.orderTime).toLocaleString('vi-VN') : 
                                     selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString('vi-VN') : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: "0.875rem" }}>
                                    Tổng tiền:
                                </span>
                                <div style={{ fontWeight: 700, color: theme.palette.primary.main, marginTop: 4, fontSize: "1.1rem" }}>
                                    {formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: "0.875rem" }}>
                                    Số điện thoại:
                                </span>
                                <div style={{ fontWeight: 500, marginTop: 4 }}>
                                    {selectedOrder.phoneNumber || selectedOrder.user?.phone || "Không có"}
                                </div>
                            </div>
                            <div>
                                <span style={{ fontWeight: 600, color: theme.palette.text.secondary, fontSize: "0.875rem" }}>
                                    Thanh toán:
                                </span>
                                <div style={{ fontWeight: 500, marginTop: 4 }}>
                                    {selectedOrder.paymentMethod || "Không có"} | 
                                    <span style={{ 
                                        color: selectedOrder.paymentStatus === 'PAID' ? theme.palette.success.main : theme.palette.error.main,
                                        fontWeight: 600,
                                        marginLeft: 4
                                    }}>
                                        {selectedOrder.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Địa chỉ giao hàng */}
                        {selectedOrder.deliveryAddress && (
                            <div style={{ marginBottom: 24 }}>
                                <span style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>
                                    📍 Địa chỉ giao hàng:
                                </span>
                                <div style={{ 
                                    padding: "12px 16px", 
                                    background: theme.palette.action.hover, 
                                    borderRadius: "8px",
                                    lineHeight: 1.5
                                }}>
                                    {selectedOrder.deliveryAddress}
                                </div>
                            </div>
                        )}

                        {/* Ghi chú */}
                        {selectedOrder.notes && (
                            <div style={{ marginBottom: 24 }}>
                                <span style={{ fontWeight: 600, marginBottom: 8, display: "block" }}>
                                    📝 Ghi chú:
                                </span>
                                <div style={{ 
                                    padding: "12px 16px", 
                                    background: theme.palette.action.hover, 
                                    borderRadius: "8px",
                                    lineHeight: 1.5,
                                    fontStyle: "italic"
                                }}>
                                    {selectedOrder.notes}
                                </div>
                            </div>
                        )}

                        {/* Danh sách món ăn */}
                        <div style={{ marginBottom: 24 }}>
                            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: "1.1rem" }}>
                                🍽️ Danh sách món ăn
                            </div>
                            {(() => {
                                // Kiểm tra nếu có items array và không rỗng
                                if (Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0) {
                                    // Đơn ghép - có items array
                                    return (
                                        <div style={{
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: "12px",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{
                                                background: theme.palette.action.hover,
                                                padding: "12px 16px",
                                                display: "grid",
                                                gridTemplateColumns: "1fr 80px 100px 120px",
                                                gap: 16,
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                color: theme.palette.text.secondary
                                            }}>
                                                <div>Món ăn</div>
                                                <div style={{ textAlign: "center" }}>SL</div>
                                                <div style={{ textAlign: "right" }}>Đơn giá</div>
                                                <div style={{ textAlign: "right" }}>Tổng tiền</div>
                                            </div>
                                            {selectedOrder.items.map((item, idx) => (
                                                <div key={idx} style={{
                                                    padding: "16px",
                                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                                    display: "grid",
                                                    gridTemplateColumns: "1fr 80px 100px 120px",
                                                    gap: 16,
                                                    alignItems: "center"
                                                }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                        {item.imageUrl ? (
                                                            <img 
                                                                src={item.imageUrl} 
                                                                alt={item.foodName || item.foodItemName || "food"} 
                                                                style={{ 
                                                                    width: 48, 
                                                                    height: 48, 
                                                                    borderRadius: 8, 
                                                                    objectFit: "cover",
                                                                    border: `2px solid ${theme.palette.divider}`
                                                                }} 
                                                            />
                                                        ) : item.avatar ? (
                                                            <img 
                                                                src={item.avatar} 
                                                                alt={item.foodName || item.foodItemName || "food"} 
                                                                style={{ 
                                                                    width: 48, 
                                                                    height: 48, 
                                                                    borderRadius: 8, 
                                                                    objectFit: "cover",
                                                                    border: `2px solid ${theme.palette.divider}`
                                                                }} 
                                                            />
                                                        ) : (
                                                            <div style={{ 
                                                                width: 48, 
                                                                height: 48, 
                                                                borderRadius: 8, 
                                                                background: theme.palette.action.hover, 
                                                                display: "flex", 
                                                                alignItems: "center", 
                                                                justifyContent: "center", 
                                                                color: theme.palette.text.secondary,
                                                                fontSize: "0.75rem"
                                                            }}>
                                                                🍽️
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                                                {item.foodName || item.foodItemName || "Không rõ"}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ textAlign: "center", fontWeight: 600 }}>
                                                        {item.quantity ?? "-"}
                                                    </div>
                                                    <div style={{ textAlign: "right", fontWeight: 500 }}>
                                                        {item.price !== undefined ? formatCurrency(item.price) : "-"}
                                                    </div>
                                                    <div style={{ textAlign: "right", fontWeight: 700, color: theme.palette.primary.main }}>
                                                        {item.price !== undefined && item.quantity ? formatCurrency(item.price * item.quantity) : "-"}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    );
                                } else if (selectedOrder.foodItemName || selectedOrder.foodName) {
                                    // Đơn lẻ - có foodItemName hoặc foodName, nhưng items array rỗng
                                    // Cần tính toán giá từ totalAmount và quantity
                                    const quantity = selectedOrder.quantity || 1;
                                    const unitPrice = selectedOrder.totalAmount / quantity;
                                    
                                    return (
                                        <div style={{
                                            border: `1px solid ${theme.palette.divider}`,
                                            borderRadius: "12px",
                                            overflow: "hidden"
                                        }}>
                                            <div style={{
                                                background: theme.palette.action.hover,
                                                padding: "12px 16px",
                                                display: "grid",
                                                gridTemplateColumns: "1fr 80px 100px 120px",
                                                gap: 16,
                                                fontWeight: 600,
                                                fontSize: "0.875rem",
                                                color: theme.palette.text.secondary
                                            }}>
                                                <div>Món ăn</div>
                                                <div style={{ textAlign: "center" }}>SL</div>
                                                <div style={{ textAlign: "right" }}>Đơn giá</div>
                                                <div style={{ textAlign: "right" }}>Tổng tiền</div>
                                            </div>
                                            <div style={{
                                                padding: "16px",
                                                display: "grid",
                                                gridTemplateColumns: "1fr 80px 100px 120px",
                                                gap: 16,
                                                alignItems: "center"
                                            }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                                    {selectedOrder.foodItemImageUrl ? (
                                                        <img 
                                                            src={selectedOrder.foodItemImageUrl}
                                                            alt={selectedOrder.foodItemName || selectedOrder.foodName || "food"} 
                                                            style={{ 
                                                                width: 48, 
                                                                height: 48, 
                                                                borderRadius: 8, 
                                                                objectFit: "cover",
                                                                border: `2px solid ${theme.palette.divider}`
                                                            }} 
                                                        />
                                                    ) : selectedOrder.imageUrl ? (
                                                        <img 
                                                            src={selectedOrder.imageUrl}
                                                            alt={selectedOrder.foodItemName || selectedOrder.foodName || "food"} 
                                                            style={{ 
                                                                width: 48, 
                                                                height: 48, 
                                                                borderRadius: 8, 
                                                                objectFit: "cover",
                                                                border: `2px solid ${theme.palette.divider}`
                                                            }} 
                                                        />
                                                    ) : selectedOrder.avatar ? (
                                                        <img 
                                                            src={selectedOrder.avatar}
                                                            alt={selectedOrder.foodItemName || selectedOrder.foodName || "food"} 
                                                            style={{ 
                                                                width: 48, 
                                                                height: 48, 
                                                                borderRadius: 8, 
                                                                objectFit: "cover",
                                                                border: `2px solid ${theme.palette.divider}`
                                                            }} 
                                                        />
                                                    ) : (
                                                        <div style={{ 
                                                            width: 48, 
                                                            height: 48, 
                                                            borderRadius: 8, 
                                                            background: theme.palette.action.hover, 
                                                            display: "flex", 
                                                            alignItems: "center", 
                                                            justifyContent: "center", 
                                                            color: theme.palette.text.secondary,
                                                            fontSize: "0.75rem"
                                                        }}>
                                                            🍽️
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div style={{ fontWeight: 600, marginBottom: 4 }}>
                                                            {selectedOrder.foodItemName || selectedOrder.foodName}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: "center", fontWeight: 600 }}>
                                                    {quantity}
                                                </div>
                                                <div style={{ textAlign: "right", fontWeight: 500 }}>
                                                    {formatCurrency(unitPrice)}
                                                </div>
                                                <div style={{ textAlign: "right", fontWeight: 700, color: theme.palette.primary.main }}>
                                                    {formatCurrency(selectedOrder.totalAmount)}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    // Không có thông tin món ăn
                                    return (
                                        <div style={{ 
                                            padding: "24px", 
                                            textAlign: "center", 
                                            color: theme.palette.text.secondary,
                                            background: theme.palette.action.hover,
                                            borderRadius: "8px"
                                        }}>
                                            Không có chi tiết món ăn.
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Tổng kết */}
                        <div style={{ 
                            textAlign: "right", 
                            padding: "16px", 
                            background: theme.palette.primary.main + "10",
                            borderRadius: "12px",
                            border: `1px solid ${theme.palette.primary.main + "20"}`
                        }}>
                            <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                                Tổng tiền: <span style={{ color: theme.palette.primary.main, fontSize: "1.3rem" }}>
                                    {formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* CSS Animations */}
            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 0.7; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                    100% { transform: scale(1); opacity: 0.7; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;