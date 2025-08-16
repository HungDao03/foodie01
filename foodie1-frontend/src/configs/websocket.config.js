// Cấu hình WebSocket
export const WEBSOCKET_CONFIG = {
    // URL WebSocket - sử dụng biến môi trường hoặc fallback về localhost
    brokerURL: import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws',
    
    // Cấu hình kết nối
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    
    // Debug mode (chỉ bật trong development)
    debug: import.meta.env.DEV ? (str) => console.log(str) : () => {},
};

// Hàm helper để lấy WebSocket URL dựa trên môi trường
export const getWebSocketURL = () => {
    // Nếu đang ở production và không có biến môi trường, tự động tạo URL
    if (import.meta.env.PROD && !import.meta.env.VITE_WEBSOCKET_URL) {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        return `${protocol}//${host}/ws`;
    }
    
    return import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws';
};
