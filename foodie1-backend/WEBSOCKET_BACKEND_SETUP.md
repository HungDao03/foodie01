# Hướng dẫn cấu hình WebSocket Backend cho Production

## Vấn đề
Backend cần được cấu hình để chấp nhận WebSocket connections từ frontend domain thay vì cho phép tất cả origin.

## Giải pháp

### 1. Cập nhật biến môi trường
Thêm hoặc cập nhật các biến môi trường sau trong backend:

```bash
# Frontend URL - QUAN TRỌNG cho WebSocket CORS
FRONTEND_URL=https://yourdomain.com

# Base URL của ứng dụng
APP_BASE_URL=https://yourdomain.com

# Port (thường là 8080)
PORT=8080
```

### 2. Cấu hình CORS
WebSocket config đã được cập nhật để sử dụng `FRONTEND_URL` từ biến môi trường.

### 3. Kiểm tra Security Config
Đảm bảo `SecurityConfig.java` cũng sử dụng `frontend.url` cho CORS:

```java
@Value("${frontend.url}")
private String frontendURL;
```

### 4. Deploy
Khi deploy, đảm bảo:
- Biến môi trường `FRONTEND_URL` được set đúng
- Domain trong `FRONTEND_URL` khớp với domain thực tế của frontend
- WebSocket endpoint `/ws` có thể truy cập được

## Kiểm tra
1. Backend logs hiển thị `Frontend URL from env: [URL]`
2. WebSocket connections từ frontend domain được chấp nhận
3. Không có lỗi CORS trong console

## Troubleshooting
- **Lỗi CORS**: Kiểm tra `FRONTEND_URL` có đúng không
- **WebSocket không kết nối**: Kiểm tra endpoint `/ws` có accessible không
- **Origin not allowed**: Kiểm tra domain trong `FRONTEND_URL`
