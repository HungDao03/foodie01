# Hướng dẫn cấu hình WebSocket cho môi trường Production

## Vấn đề
Trong môi trường production, WebSocket không thể kết nối đến `ws://localhost:8080/ws` vì localhost chỉ hoạt động trên máy local.

## Giải pháp

### 1. Tạo file .env
Tạo file `.env` trong thư mục `foodie1-frontend/` với nội dung:

```bash
# API Base URL
VITE_API_BASE_URL=https://yourdomain.com/api

# WebSocket URL - QUAN TRỌNG!
VITE_WEBSOCKET_URL=wss://yourdomain.com/ws

# Frontend URL
VITE_FRONTEND_URL=https://yourdomain.com
```

### 2. Cấu hình WebSocket URL
- **Development**: `ws://localhost:8080/ws`
- **Production**: `wss://yourdomain.com/ws` (HTTPS) hoặc `ws://yourdomain.com/ws` (HTTP)

### 3. Cấu hình Backend
Đảm bảo backend được cấu hình để chấp nhận WebSocket connections từ domain của bạn.

### 4. Cấu hình CORS
Backend cần cho phép WebSocket connections từ frontend domain.

## Kiểm tra
1. Mở Developer Tools (F12)
2. Vào tab Console
3. Tìm log: "Connecting to WebSocket: [URL]"
4. Đảm bảo URL không phải localhost

## Troubleshooting
- **Lỗi "Connection failed"**: Kiểm tra WebSocket URL trong .env
- **Lỗi CORS**: Kiểm tra cấu hình CORS trong backend
- **Lỗi SSL**: Sử dụng `wss://` cho HTTPS, `ws://` cho HTTP
