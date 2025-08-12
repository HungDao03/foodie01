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
            console.log('Bắt đầu fetch dữ liệu...');
            try {
                const responses = await Promise.all([
                    UserService.getAllUsers(),
                    FoodItemsService.getAllFoods(),
                    OrderService.getTotalOrders(),
                    OrderService.getWeeklyRevenueStats(),
                    OrderService.getTodayRevenue(),
                    OrderService.getOrdersToday()
                ]);

                // Log tất cả responses để debug
                console.log('Responses từ API:', responses);

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
                console.log('Dữ liệu biểu đồ sau khi xử lý:', safeChartData);
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
                
                console.log('Dữ liệu đơn hàng sau khi xử lý:', safeOrders);
                setRecentOrders(safeOrders);

            } catch (err) {
                console.error("Lỗi khi fetch dữ liệu:", {
                    message: err.message,
                    stack: err.stack,
                    response: err.response?.data
                });
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
            'preparing': { icon: AlertCircle, color: '#1976d2', bg: '#e3f2fd', text: 'Đang chuẩn bị' },
            'delivering': { icon: TrendingUp, color: '#7b1fa2', bg: '#f3e5f5', text: 'Đang giao' },
            'completed': { icon: CheckCircle, color: '#388e3c', bg: '#e8f5e8', text: 'Hoàn thành' },
            'cancelled': { icon: XCircle, color: '#d32f2f', bg: '#ffebee', text: 'Đã hủy' }
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
            padding: "24px",
            backgroundColor: theme.palette.background.default,
            minHeight: "100vh",
            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
        },
        paper: {
            backgroundColor: theme.palette.background.paper,
            borderRadius: "8px",
            boxShadow: theme.shadows[1],
            transition: "0.3s"
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
            transition: "transform 0.3s ease, box-shadow 0.3s ease"
        },
        statCardHover: {
            transform: "translateY(-6px) scale(1.02)",
            boxShadow: theme.shadows[4]
        },
        avatar: {
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "24px"
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
                    backgroundColor: item.bgColor,
                    border: `1px solid ${item.color}20`,
                    ...(isHovered ? styles.statCardHover : {})
                }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ color: theme.palette.text.secondary, fontSize: "0.875rem", fontWeight: 500, marginBottom: "8px" }}>
                            {item.label}
                        </div>
                        <div style={{ fontSize: "2rem", fontWeight: "bold", color: theme.palette.text.primary, marginBottom: "8px" }}>
                            {item.value}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <TrendIcon size={16} color={trendColor} />
                            <span style={{ color: trendColor, fontWeight: 600, fontSize: "0.875rem" }}>
                                {item.trend}
                            </span>
                        </div>
                    </div>
                    <div style={{
                        ...styles.avatar,
                        backgroundColor: item.color,
                        boxShadow: `0 4px 20px ${item.color}30`
                    }}>
                        <IconComponent size={24} />
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
        
        if (Array.isArray(order.items) && order.items.length > 0) {
            foodNames = order.items
                .map(item => item?.foodName || item?.foodItemName || "")
                .filter(Boolean)
                .join(", ") || "Không có món ăn";
        } else if (order.foodItemName) {
            foodNames = order.foodItemName;
        } else {
            foodNames = "Không có thông tin món ăn";
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
                        </div>
                        <div style={{ fontSize: "0.875rem", color: theme.palette.text.secondary, marginBottom: "4px" }}>
                            {foodNames || "Không có món ăn"}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: theme.palette.text.secondary }}>
                            {formatTime(order.createdAt)}
                        </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {formatCurrency(order.totalAmount || order.total)}
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
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{ fontSize: "2.125rem", fontWeight: "bold", color: theme.palette.text.primary, margin: "0 0 8px 0" }}>
                    Dashboard Quản trị
                </h1>
                <p style={{ color: theme.palette.text.secondary, fontSize: "1rem", margin: 0 }}>
                    Chào mừng trở lại! Đây là tổng quan về hoạt động hệ thống.
                </p>
            </div>

            <div style={{ ...styles.grid, ...styles.gridCols4 }}>
                {safeStats.map((item, index) => (
                    <StatCard key={index} item={item} />
                ))}
            </div>

            <div style={{ ...styles.grid, ...styles.gridCols2 }}>
                <div style={{ ...styles.paper, padding: "24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <div>
                            <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.palette.text.primary, marginBottom: 4 }}>
                                Doanh thu tuần
                            </h2>
                            <p style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>7 ngày qua</p>
                        </div>
                    </div>
                    <div style={{ height: "280px" }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={safeChartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0.2} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 12, fill: theme.palette.text.secondary }}
                                    tickFormatter={(value) => `${(value / 1000).toLocaleString("vi-VN")}k`}
                                />
                                <Tooltip
                                    formatter={(value) => `${value.toLocaleString("vi-VN")}₫`}
                                    contentStyle={{
                                        backgroundColor: theme.palette.background.paper,
                                        border: "none",
                                        borderRadius: "8px",
                                        boxShadow: theme.shadows[2],
                                        color: theme.palette.text.primary
                                    }}
                                />
                                <Bar
                                    dataKey="revenue"
                                    fill="url(#colorRevenue)"
                                    radius={[10, 10, 0, 0]}
                                    barSize={40}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Thêm phần Đơn hàng mới nhất */}
                <div style={{ ...styles.paper, padding: "24px" }}>
                    <div style={{ marginBottom: "24px" }}>
                        <h2 style={{ fontSize: "1.25rem", fontWeight: "bold", color: theme.palette.text.primary, marginBottom: 4 }}>
                            Đơn hàng mới nhất
                        </h2>
                        <p style={{ color: theme.palette.text.secondary, fontSize: "0.875rem" }}>
                            {recentOrders.length} đơn hàng gần đây
                        </p>
                    </div>
                    <div style={{
                        height: "280px",
                        overflowY: "auto",
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: "8px"
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
                                color: theme.palette.text.secondary
                            }}>
                                <ShoppingCart size={48} style={{ marginBottom: "16px", opacity: 0.5 }} />
                                <p>Chưa có đơn hàng nào</p>
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
                            minWidth: "400px",
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
                        <h2 style={{ fontWeight: "bold", fontSize: "1.5rem", marginBottom: 16 }}>
                            Chi tiết đơn hàng #{selectedOrder.id || selectedOrder.orderCode}
                        </h2>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                <span style={{ fontWeight: 600, color: theme.palette.text.primary }}>
                                    Trạng thái:
                                </span>
                                <span style={{
                                    padding: "4px 12px",
                                    borderRadius: "12px",
                                    background: getStatusConfig(selectedOrder.status).bg,
                                    color: getStatusConfig(selectedOrder.status).color,
                                    fontWeight: 500
                                }}>
                                    {getStatusConfig(selectedOrder.status).text}
                                </span>
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontWeight: 600 }}>Địa chỉ giao hàng:</span> {selectedOrder.deliveryAddress || "Không có"}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontWeight: 600 }}>Số điện thoại:</span> {selectedOrder.phoneNumber || selectedOrder.user?.phone || "Không có"}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontWeight: 600 }}>Trạng thái thanh toán:</span> {selectedOrder.paymentStatus || "Không có"}
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <span style={{ fontWeight: 600 }}>Phương thức thanh toán:</span> {selectedOrder.paymentMethod || "Không có"}
                        </div>
                        <div style={{ fontWeight: 600, marginBottom: 8 }}>Danh sách món ăn:</div>
                        {Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                            <table style={{ width: "100%", fontSize: "0.95rem", marginBottom: 16 }}>
                                <thead>
                                <tr style={{ color: theme.palette.text.secondary }}>
                                    <th style={{ textAlign: "left" }}>Hình ảnh</th>
                                    <th style={{ textAlign: "left" }}>Tên món</th>
                                    <th style={{ textAlign: "right" }}>Số lượng</th>
                                    <th style={{ textAlign: "right" }}>Giá</th>
                                </tr>
                                </thead>
                                <tbody>
                                {selectedOrder.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td>
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.foodName || item.foodItemName || "food"} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                                            ) : item.avatar ? (
                                                <img src={item.avatar} alt={item.foodName || item.foodItemName || "food"} style={{ width: 48, height: 48, borderRadius: 8, objectFit: "cover" }} />
                                            ) : (
                                                <div style={{ width: 48, height: 48, borderRadius: 8, background: theme.palette.action.hover, display: "flex", alignItems: "center", justifyContent: "center", color: theme.palette.text.secondary }}>
                                                    Không có
                                                </div>
                                            )}
                                        </td>
                                        <td>{item.foodName || item.foodItemName || "Không rõ"}</td>
                                        <td style={{ textAlign: "right" }}>{item.quantity ?? "-"}</td>
                                        <td style={{ textAlign: "right" }}>{item.price !== undefined ? formatCurrency(item.price) : "-"}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <div style={{ color: theme.palette.text.secondary }}>Không có chi tiết món ăn.</div>
                        )}
                        <div style={{ fontWeight: 600, marginTop: 16, textAlign: "right" }}>
                            Tổng tiền: <span style={{ color: theme.palette.primary.main }}>{formatCurrency(selectedOrder.totalAmount || selectedOrder.total)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;