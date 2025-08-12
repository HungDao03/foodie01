package com.foodie1.config;

import com.foodie1.config.DTO.UserPrinciple;
import com.foodie1.config.service.EmailService;
import com.foodie1.config.service.JwtService;
import com.foodie1.model.User;
import com.foodie1.service.user.IUserService;

import jakarta.servlet.ServletException;
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



@Component
public class GoogleOAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final IUserService userService;
    private final EmailService emailService;

    @Value("${frontend.urf}")
    private String frontendURL;


    @Autowired
    public GoogleOAuth2SuccessHandler(JwtService jwtService, IUserService userService, EmailService emailService) {
        this.jwtService = jwtService;
        this.userService = userService;
        this.emailService = emailService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        Optional<User> optionalUser = userService.findByEmail(email);
        User user;

        try {
            if (optionalUser.isEmpty()) { // Nếu người dùng chưa tồn tại
                // Đăng ký người dùng mới từ thông tin Google
                user = userService.registerGoogleUser(email, oAuth2User);
                if (user == null) {
                    throw new RuntimeException("Không thể tạo tài khoản mới.");
                }
                // Gửi email xác minh và lấy token
                String verificationToken = emailService.sendVerificationEmail(user);
                user.setVerificationToken(verificationToken); // Lưu token xác minh
                userService.save(user); // Lưu thông tin người dùng vào cơ sở dữ liệu

                // Chuyển hướng đến trang xác minh
                response.sendRedirect(frontendURL + "verify-account");
                return;
            }

            user = optionalUser.get(); // Lấy người dùng hiện có

            // Kiểm tra xem tài khoản đã được xác minh chưa
            if (!user.isVerified()) {
                // Nếu chưa xác minh, gửi lại email xác minh
                String verificationToken = emailService.sendVerificationEmail(user);
                user.setVerificationToken(verificationToken);
                userService.save(user); // Lưu token mới (cần thiết vì đây là người dùng cũ)

                // Chuyển hướng đến trang xác minh
                response.sendRedirect(frontendURL + "verify-account");
                return;
            }

            // Nếu tài khoản đã được xác minh, tạo token JWT và chuyển hướng
            UserDetails userDetails = UserPrinciple.build(user);
            String token = jwtService.generateTokenLogin(userDetails);

            String authorities = userDetails.getAuthorities().stream()
                    .map(role -> "{\"authority\":\"" + role.getAuthority() + "\"}")
                    .collect(Collectors.joining(","));

            String json = "{"
                    + "\"id\":" + user.getId() + ","
                    + "\"username\":\"" + user.getUsername() + "\","
                    + "\"fullName\":\"" + user.getFullName() + "\","
                    + "\"email\":\"" + user.getEmail() + "\","
                    + "\"token\":\"" + token + "\","
                    + "\"type\":\"Bearer\","
                    + "\"authorities\":[" + authorities + "]"
                    + "}";

            String encodedUser = URLEncoder.encode(json, StandardCharsets.UTF_8);
            String redirectUrl = frontendURL + "oauth2-success?user=" + encodedUser;

            response.sendRedirect(redirectUrl);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("text/plain;charset=UTF-8");
            response.getWriter().write("Đã có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }
}