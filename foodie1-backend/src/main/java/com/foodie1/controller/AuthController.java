package com.foodie1.controller;

import com.foodie1.config.jwt.JwtResponse;
import com.foodie1.config.service.EmailService;
import com.foodie1.config.service.JwtService;
import com.foodie1.dto.request.UserRegisterRequest;

import com.foodie1.model.Role;
import com.foodie1.model.User;
import com.foodie1.service.role.IRoleService;
import com.foodie1.service.user.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.net.URI;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔐 AUTH CONTROLLER - XỬ LÝ XÁC THỰC VÀ ĐĂNG KÝ
 * 
 * Controller này xử lý:
 * - Đăng nhập bằng username/password
 * - Đăng ký tài khoản mới
 * - Xác minh email
 * - Tạo admin
 */
@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;  // Quản lý xác thực

    @Autowired
    private JwtService jwtService;        // Service tạo và xác thực JWT

    @Autowired
    private IUserService userService;     // Service xử lý user

    @Autowired
    private IRoleService roleService;     // Service xử lý role

    @Autowired
    private PasswordEncoder passwordEncoder;  // Encoder mã hóa password

    @Autowired
    private EmailService emailService;    // Service gửi email

   @Value("${frontend.url}")
    private String frontendURL;  // URL của frontend

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    /**
     * 🔑 PHƯƠNG THỨC ĐĂNG NHẬP
     * 
     * LUỒNG XỬ LÝ:
     * 1. Nhận username/password từ request body
     * 2. Sử dụng AuthenticationManager để xác thực
     * 3. Nếu thành công -> tạo JWT token
     * 4. Trả về thông tin user và JWT token
     * 
     * @param user User object chứa username và password
     * @return JWT token và thông tin user nếu đăng nhập thành công
     */
    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            System.out.println("🔑 Bắt đầu đăng nhập cho user: " + user.getUsername());
            
            // 🔐 BƯỚC 1: XÁC THỰC USERNAME/PASSWORD
            // AuthenticationManager sẽ:
            // - Load user details từ database
            // - Verify password bằng BCrypt
            // - Kiểm tra tài khoản có bị khóa/disabled không
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            
            // ✅ BƯỚC 2: XÁC THỰC THÀNH CÔNG
            System.out.println("✅ Xác thực thành công, thiết lập security context");
            
            // Thiết lập authentication context cho request hiện tại
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // 🎯 BƯỚC 3: TẠO JWT TOKEN
            String jwt = jwtService.generateTokenLogin(authentication);
            System.out.println("🎯 Đã tạo JWT token");
            
            // 📋 BƯỚC 4: LẤY THÔNG TIN USER
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userService.findByUsername(user.getUsername());
            
            // 🚀 BƯỚC 5: TRẢ VỀ RESPONSE
            System.out.println("🚀 Đăng nhập thành công, trả về JWT token");
            return ResponseEntity.ok(new JwtResponse(
                    currentUser.getId(),           // User ID
                    jwt,                          // JWT token
                    userDetails.getUsername(),     // Username
                    userDetails.getUsername(),     // Username (duplicate)
                    currentUser.getFullName(),     // Full name
                    userDetails.getAuthorities()   // Authorities (roles)
            ));
            
        } catch (Exception e) {
            // ❌ XÁC THỰC THẤT BẠI
            System.err.println("❌ Đăng nhập thất bại: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Tên đăng nhập hoặc mật khẩu không đúng");
        }
    }

    /**
     * 📝 PHƯƠNG THỨC ĐĂNG KÝ TÀI KHOẢN MỚI
     * 
     * LUỒNG XỬ LÝ:
     * 1. Validate dữ liệu đầu vào
     * 2. Kiểm tra trùng lặp (username, email, phone)
     * 3. Kiểm tra domain email ảo
     * 4. Mã hóa password
     * 5. Tạo user và gán role
     * 6. Gửi email xác minh
     * 
     * @param registerRequest Thông tin đăng ký
     * @param bindingResult Kết quả validate
     * @return Thông báo thành công hoặc lỗi
     */
    @PostMapping("/api/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterRequest registerRequest, BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();

        // ✅ BƯỚC 1: KIỂM TRA VALIDATE TỪ @Valid
        if (bindingResult.hasErrors()) {
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
        }

        // 🔍 BƯỚC 2: KIỂM TRA TRÙNG LẶP
        // 2.1. Kiểm tra trùng username
        if (userService.findByUsername(registerRequest.getUsername()) != null) {
            errors.put("username", "Tên đăng nhập đã tồn tại!");
        }

        // 2.2. Kiểm tra trùng email
        if (userService.findByEmail(registerRequest.getEmail()).isPresent()) {
            errors.put("email", "Email đã tồn tại!");
        }

        // 2.3. Kiểm tra trùng số điện thoại
        if (userService.findByPhoneNumber(registerRequest.getPhoneNumber()).isPresent()) {
            errors.put("phoneNumber", "Số điện thoại đã tồn tại!");
        }

        // 🚫 BƯỚC 3: KIỂM TRA DOMAIN EMAIL ẢO
        String email = registerRequest.getEmail();
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        List<String> blacklistedDomains = List.of(
                "tempmail.com", "10minutemail.com", "mailinator.com",
                "guerrillamail.com", "throwawaymail.com", "yopmail.com"
        );
        if (blacklistedDomains.contains(domain)) {
            errors.put("email", "Email không hợp lệ. Vui lòng sử dụng email thật.");
        }

        // ❌ BƯỚC 4: NẾU CÓ LỖI, TRẢ VỀ LUÔN
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // 🆕 BƯỚC 5: TẠO USER MỚI
        System.out.println("🆕 Bắt đầu tạo user mới: " + registerRequest.getUsername());
        
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));  // Mã hóa password bằng BCrypt
        user.setEmail(email);
        user.setFullName(registerRequest.getFullName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setAddress(registerRequest.getAddress());
        user.setVerified(false);  // Chưa xác minh email

        // 👑 BƯỚC 6: GÁN VAI TRÒ
        Role userRole = roleService.findByName("ROLE_USER");
        if (userRole == null) {
            errors.put("role", "Lỗi: Không tìm thấy vai trò người dùng!");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errors);
        }
        user.setRoles(Set.of(userRole));

        // 📧 BƯỚC 7: GỬI EMAIL XÁC MINH VÀ LƯU USER
        try {
            System.out.println("📧 Gửi email xác minh cho: " + email);
            
            String token = emailService.sendVerificationEmail(user);
            user.setVerificationToken(token);
            userService.save(user);

            System.out.println("✅ Đăng ký thành công, user đã được lưu vào database");
            return ResponseEntity.ok("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi gửi email xác minh: " + e.getMessage());
            errors.put("email", "Không thể gửi email xác minh. Vui lòng kiểm tra lại địa chỉ email.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errors);
        }
    }

    /**
     * ✅ PHƯƠNG THỨC XÁC MINH EMAIL
     * 
     * LUỒNG XỬ LÝ:
     * 1. Nhận verification token từ URL parameter
     * 2. Tìm user theo token
     * 3. Đánh dấu user đã xác minh
     * 4. Xóa verification token
     * 
     * @param token Verification token từ email
     * @return Thông báo xác minh thành công hoặc thất bại
     */
    @GetMapping("/api/verify")
    public ResponseEntity<String> verifyUser(@RequestParam String token) {
        System.out.println("🔍 Bắt đầu xác minh email với token: " + token.substring(0, Math.min(10, token.length())) + "...");
        
        Optional<User> userOpt = userService.findByVerificationToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            System.out.println("👤 Tìm thấy user cần xác minh: " + user.getUsername());
            
            // ✅ ĐÁNH DẤU USER ĐÃ XÁC MINH
            user.setVerified(true);
            user.setVerificationToken(null);  // Xóa token xác minh
            userService.save(user);
            
            System.out.println("✅ Xác minh email thành công cho user: " + user.getUsername());
            return ResponseEntity.ok("Xác minh tài khoản thành công! Bây giờ bạn có thể đăng nhập.");
            
        } else {
            System.err.println("❌ Không tìm thấy user với token: " + token);
            return ResponseEntity.badRequest().body("Token xác minh không hợp lệ hoặc đã hết hạn.");
        }
    }
}

