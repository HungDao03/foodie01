package com.foodie1.config;

import com.foodie1.config.DTO.UserPrinciple;
import com.foodie1.config.service.EmailService;
import com.foodie1.config.service.JwtService;
import com.foodie1.model.User;
import com.foodie1.service.user.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 🔐 GOOGLE OAUTH2 SUCCESS HANDLER
 * 
 * Class này xử lý khi người dùng đăng nhập Google OAuth2 thành công
 * 
 * LUỒNG XỬ LÝ:
 * 1. Nhận thông tin user từ Google
 * 2. Kiểm tra user đã tồn tại trong DB chưa
 * 3. Nếu chưa có -> tạo user mới + gửi email xác minh
 * 4. Nếu đã có nhưng chưa xác minh -> gửi lại email xác minh
 * 5. Nếu đã xác minh -> tạo JWT token và redirect về frontend
 */
@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;        // Service tạo và xác thực JWT
    private final IUserService userService;     // Service xử lý user
    private final EmailService emailService;    // Service gửi email

    @Value("${frontend.url}")
    private String frontendURL;  // URL của frontend để redirect

    @Autowired
    public GoogleOAuth2SuccessHandler(JwtService jwtService, IUserService userService, EmailService emailService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.emailService = emailService;
    }

    /**
     * 🚀 PHƯƠNG THỨC CHÍNH: Xử lý khi OAuth2 đăng nhập thành công
     * 
     * @param request HTTP request
     * @param response HTTP response
     * @param authentication Thông tin xác thực từ Spring Security
     */
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        // 📧 LẤY THÔNG TIN USER TỪ GOOGLE
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");  // Lấy email từ Google profile
        
        // 🔍 KIỂM TRA USER ĐÃ TỒN TẠI TRONG DB CHƯA
        Optional<User> optionalUser = userService.findByEmail(email);
        User user;

        try {
            // 🆕 TRƯỜNG HỢP 1: USER MỚI (chưa có trong DB)
            if (optionalUser.isEmpty()) {
                System.out.println("🆕 Tạo user mới từ Google OAuth2: " + email);
                
                // Tạo tài khoản mới từ thông tin Google
                user = userService.registerGoogleUser(email, oAuth2User);
                if (user == null) {
                    throw new RuntimeException("Không thể tạo tài khoản mới.");
                }
                
                // 📧 GỬI EMAIL XÁC MINH VÀ LƯU TOKEN
                String verificationToken = emailService.sendVerificationEmail(user);
                user.setVerificationToken(verificationToken);  // Lưu token xác minh
                userService.save(user);  // Lưu thông tin user vào DB

                // 🔄 CHUYỂN HƯỚNG ĐẾN TRANG XÁC MINH
                System.out.println("📧 Chuyển hướng user mới đến trang xác minh email");
                response.sendRedirect(frontendURL + "verify-account");
                return;
            }

            // 👤 TRƯỜNG HỢP 2: USER ĐÃ TỒN TẠI
            user = optionalUser.get();
            System.out.println("👤 User đã tồn tại: " + user.getUsername());

            // ✅ KIỂM TRA TÀI KHOẢN ĐÃ ĐƯỢC XÁC MINH CHƯA
            if (!user.isVerified()) {
                System.out.println("📧 User chưa xác minh, gửi lại email xác minh");
                
                // Nếu chưa xác minh, gửi lại email xác minh
                String verificationToken = emailService.sendVerificationEmail(user);
                user.setVerificationToken(verificationToken);
                userService.save(user);  // Lưu token mới

                // 🔄 CHUYỂN HƯỚNG ĐẾN TRANG XÁC MINH
                response.sendRedirect(frontendURL + "verify-account");
                return;
            }

            // 🎉 TRƯỜNG HỢP 3: USER ĐÃ XÁC MINH -> TẠO JWT VÀ ĐĂNG NHẬP THÀNH CÔNG
            System.out.println("🎉 User đã xác minh, tạo JWT token và đăng nhập");
            
            // Tạo UserDetails để generate JWT
            UserDetails userDetails = UserPrinciple.build(user);
            String token = jwtService.generateTokenLogin(userDetails);

            // 📋 CHUẨN BỊ THÔNG TIN USER ĐỂ GỬI VỀ FRONTEND
            String authorities = userDetails.getAuthorities().stream()
                    .map(role -> "{\"authority\":\"" + role.getAuthority() + "\"}")
                    .collect(Collectors.joining(","));

            // 🏗️ TẠO JSON CHỨA THÔNG TIN USER VÀ TOKEN
            String json = "{"
                    + "\"id\":" + user.getId() + ","
                    + "\"username\":\"" + user.getUsername() + "\","
                    + "\"fullName\":\"" + user.getFullName() + "\","
                    + "\"email\":\"" + user.getEmail() + "\","
                    + "\"token\":\"" + token + "\","
                    + "\"type\":\"Bearer\","
                    + "\"authorities\":[" + authorities + "]"
                    + "}";

            // 🔗 ENCODE JSON VÀ TẠO REDIRECT URL
            String encodedUser = URLEncoder.encode(json, StandardCharsets.UTF_8);
            String redirectUrl = frontendURL + "oauth2-success?user=" + encodedUser;

            // 🚀 CHUYỂN HƯỚNG VỀ FRONTEND VỚI THÔNG TIN USER VÀ TOKEN
            System.out.println("🚀 Chuyển hướng về frontend với JWT token");
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            // ❌ XỬ LÝ LỖI
            System.err.println("❌ Lỗi trong OAuth2 success handler: " + e.getMessage());
            e.printStackTrace();
            
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("Đã có lỗi xảy ra: " + e.getMessage());
        }
    }
}