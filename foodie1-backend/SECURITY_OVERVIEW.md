# 🔐 TỔNG QUAN CƠ CHẾ BẢO MẬT - FOODIE BACKEND

## 📋 **TỔNG QUAN HỆ THỐNG**

Dự án Foodie sử dụng **Spring Security** với **JWT (JSON Web Token)** và **OAuth2** để xây dựng hệ thống bảo mật hoàn chỉnh, bao gồm:

- ✅ **JWT Authentication**: Xác thực stateless
- ✅ **Google OAuth2**: Đăng nhập bằng Google account
- ✅ **Role-based Authorization**: Phân quyền dựa trên vai trò
- ✅ **Email Verification**: Xác minh tài khoản qua email
- ✅ **Password Encryption**: Mã hóa mật khẩu bằng BCrypt
- ✅ **CORS Protection**: Bảo vệ cross-origin requests

---

## 🏗️ **KIẾN TRÚC BẢO MẬT**

### **1. SecurityConfig.java** 🔧
- **Vai trò**: Cấu hình bảo mật chính của ứng dụng
- **Chức năng**:
  - Định nghĩa phân quyền truy cập các endpoint
  - Cấu hình OAuth2 với Google
  - Thiết lập JWT filter chain
  - Cấu hình CORS và CSRF

### **2. JwtAuthenticationTokenFilter.java** 🔍
- **Vai trò**: Filter xác thực JWT cho mọi request
- **Chức năng**:
  - Trích xuất JWT từ header Authorization
  - Validate JWT token
  - Load user details và thiết lập authentication context

### **3. JwtService.java** 🎯
- **Vai trò**: Service xử lý JWT operations
- **Chức năng**:
  - Tạo JWT token với thời hạn 24 giờ
  - Validate JWT token
  - Trích xuất thông tin từ JWT

### **4. GoogleOAuth2SuccessHandler.java** 🌐
- **Vai trò**: Xử lý khi OAuth2 đăng nhập thành công
- **Chức năng**:
  - Nhận thông tin user từ Google
  - Tạo hoặc cập nhật user trong database
  - Gửi email xác minh nếu cần
  - Tạo JWT token và redirect về frontend

### **5. UserPrinciple.java** 👤
- **Vai trò**: Bridge giữa User model và Spring Security
- **Chức năng**:
  - Implement UserDetails interface
  - Quản lý authorities (roles)
  - Kiểm tra trạng thái tài khoản (verified, locked, expired)

---

## 🔄 **LUỒNG XÁC THỰC CHI TIẾT**

### **A. ĐĂNG NHẬP THÔNG THƯỜNG (Username/Password)**

```
1. Client gửi POST /api/login với username/password
   ↓
2. AuthController nhận request
   ↓
3. AuthenticationManager.authenticate() xác thực:
   - Load user details từ database
   - Verify password bằng BCrypt
   - Kiểm tra tài khoản có bị khóa/disabled không
   ↓
4. Nếu thành công -> tạo JWT token
   ↓
5. Trả về JWT token và thông tin user
```

### **B. ĐĂNG NHẬP GOOGLE OAUTH2**

```
1. User click "Đăng nhập bằng Google"
   ↓
2. Redirect đến Google OAuth2
   ↓
3. User xác thực với Google
   ↓
4. Google redirect về /login/oauth2/code/google
   ↓
5. GoogleOAuth2SuccessHandler xử lý:
   a) Lấy thông tin user từ Google
   b) Kiểm tra user đã tồn tại trong DB chưa
   c) Nếu chưa có -> tạo user mới + gửi email xác minh
   d) Nếu đã có nhưng chưa xác minh -> gửi lại email xác minh
   e) Nếu đã xác minh -> tạo JWT token và redirect về frontend
```

### **C. XÁC THỰC JWT CHO MỌI REQUEST**

```
1. Client gửi request với header: Authorization: Bearer <JWT>
   ↓
2. JwtAuthenticationTokenFilter xử lý:
   a) Trích xuất JWT từ header
   b) Validate JWT token
   c) Nếu hợp lệ -> load user details và set authentication context
   d) Nếu không hợp lệ -> request tiếp tục mà không có authentication
   ↓
3. Spring Security kiểm tra quyền truy cập endpoint
   ↓
4. Controller xử lý request
```

---

## 🚪 **PHÂN QUYỀN TRUY CẬP**

### **✅ CHO PHÉP TẤT CẢ (permitAll)**
- `/api/login` - Đăng nhập
- `/api/register` - Đăng ký
- `/api/verify` - Xác minh email
- `/login/oauth2/code/**` - OAuth2 callback URLs
- `GET /api/categories` - Xem danh mục
- `GET /api/food-items/**` - Xem món ăn
- `/uploads/**` - Tài nguyên tĩnh
- `/ws/**` - WebSocket (chat realtime)

### **✏️ CHỈ ADMIN MỚI ĐƯỢC**
- `POST /api/categories` - Tạo danh mục
- `POST /api/food-items` - Tạo món ăn
- `PUT /api/food-items/**` - Sửa món ăn
- `DELETE /api/food-items/**` - Xóa món ăn
- `GET /api/users/all` - Xem danh sách user

### **🛒 CẦN ĐĂNG NHẬP**
- `/api/orders/**` - Quản lý đơn hàng
- Tất cả request khác không được liệt kê ở trên

---

## 🔐 **CÁC ĐIỂM BẢO MẬT QUAN TRỌNG**

### **1. JWT Security**
- **Secret Key**: 256-bit HMAC SHA-256
- **Thời hạn**: 24 giờ
- **Algorithm**: HS256
- **Stateless**: Không lưu session

### **2. Password Security**
- **Encoder**: BCrypt với strength = 10
- **Salt**: Tự động tạo và lưu trong hash
- **Verification**: So sánh hash thay vì plain text

### **3. OAuth2 Security**
- **Provider**: Google OAuth2
- **Scope**: openid, email, profile
- **Redirect URI**: Được bảo vệ bởi Google
- **User Info**: Chỉ lấy thông tin cần thiết

### **4. CORS Protection**
- **Allowed Origins**: Chỉ frontend URL được chỉ định
- **Credentials**: Cho phép gửi auth headers
- **Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH
- **Headers**: Authorization, Content-Type, X-Requested-With, Accept

### **5. Email Verification**
- **Token**: Unique verification token
- **Expiration**: Token có thời hạn
- **Security**: Chỉ user đã xác minh mới có thể đăng nhập

---

## 🚨 **XỬ LÝ LỖI BẢO MẬT**

### **Authentication Errors (401 Unauthorized)**
- Chưa đăng nhập
- JWT token không hợp lệ
- JWT token đã hết hạn

### **Authorization Errors (403 Forbidden)**
- Không có quyền truy cập endpoint
- Role không đủ quyền

### **Validation Errors (400 Bad Request)**
- Dữ liệu đầu vào không hợp lệ
- Email/username đã tồn tại
- Domain email ảo

---

## 📱 **FLOW HOÀN CHỈNH CỦA MỘT REQUEST**

```
Client Request
     ↓
CORS Preflight (OPTIONS) → Bỏ qua nếu cần
     ↓
JWT Filter → Trích xuất và validate JWT
     ↓
Spring Security → Kiểm tra quyền truy cập
     ↓
Controller → Xử lý business logic
     ↓
Response → Trả về kết quả
```

---

## 🔧 **CẤU HÌNH MÔI TRƯỜNG**

### **Biến môi trường cần thiết:**
```bash
# Database
DATASOURCE_URL=jdbc:mysql://localhost:3306/foodie
DATASOURCE_USERNAME=root
DATASOURCE_PASSWORD=password

# Frontend
FRONTEND_URL=http://localhost:3000

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email
EMAIL_USERNAME=your_gmail@gmail.com
EMAIL_PASSWORD=your_app_password
```

---

## 📚 **TÀI LIỆU THAM KHẢO**

- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/)
- [JWT.io](https://jwt.io/)
- [Google OAuth2 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [BCrypt Algorithm](https://en.wikipedia.org/wiki/Bcrypt)

---

*Tài liệu này được tạo để giải thích chi tiết cơ chế bảo mật của dự án Foodie Backend.*
