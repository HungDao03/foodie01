package com.foodie1.config;

import com.foodie1.config.jwt.JwtAuthenticationTokenFilter;
import com.foodie1.service.user.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.BeanIds;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

/**
 * 🔐 CẤU HÌNH BẢO MẬT CHÍNH CỦA ỨNG DỤNG
 * 
 * File này định nghĩa toàn bộ cơ chế bảo mật:
 * - Cấu hình Spring Security
 * - Phân quyền truy cập các endpoint
 * - Cấu hình OAuth2 với Google
 * - Cấu hình JWT authentication
 * - Cấu hình CORS
 */
@EnableWebSecurity  // Bật Spring Security
@Configuration      // Đánh dấu là class cấu hình
@EnableMethodSecurity(prePostEnabled = true)  // Bật bảo mật method-level với @PreAuthorize
public class SecurityConfig {

    @Value("${frontend.url}")
    private String frontendURL;  // URL của frontend để cấu hình CORS

    @Autowired
    private IUserService userService;  // Service xử lý user

    @Autowired
    private JwtAuthenticationTokenFilter jwtAuthenticationTokenFilter;  // Filter xác thực JWT

    @Autowired
    private GoogleOAuth2SuccessHandler googleOAuth2SuccessHandler;  // Handler xử lý OAuth2 thành công

    /**
     * 🔑 BEAN: AuthenticationManager
     * Quản lý quá trình xác thực (authentication) của ứng dụng
     * Được sử dụng trong AuthController để xác thực username/password
     */
    @Bean(BeanIds.AUTHENTICATION_MANAGER)
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * 🔐 BEAN: PasswordEncoder
     * Sử dụng BCrypt để mã hóa mật khẩu với strength = 10 (độ mạnh cao)
     * BCrypt tự động tạo salt và hash password
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    /**
     * 🔄 BEAN: AuthenticationProvider
     * Cung cấp cơ chế xác thực cho Spring Security
     * Sử dụng UserService để load user details và BCrypt để verify password
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authenticationProvider = new DaoAuthenticationProvider();
        authenticationProvider.setUserDetailsService((UserDetailsService) userService);  // Service load user
        authenticationProvider.setPasswordEncoder(passwordEncoder());  // Encoder để verify password
        return authenticationProvider;
    }

    /**
     * 🌐 BEAN: CORS Configuration
     * Cấu hình Cross-Origin Resource Sharing để frontend có thể gọi API
     * Chỉ cho phép frontend URL được chỉ định
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(frontendURL));  // Chỉ cho phép frontend URL
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));  // Frontend có thể đọc header Authorization
        configuration.setAllowCredentials(true);  // Cho phép gửi credentials (cookies, auth headers)
        configuration.setMaxAge(3600L);  // Cache CORS preflight trong 1 giờ

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);  // Áp dụng cho tất cả endpoints
        return source;
    }

    /**
     * 🚀 BEAN CHÍNH: SecurityFilterChain
     * Định nghĩa toàn bộ luồng bảo mật của ứng dụng
     * Đây là nơi cấu hình chính cho Spring Security
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                // 🔒 VÔ HIỆU HÓA CSRF (vì sử dụng JWT stateless)
                .csrf(AbstractHttpConfigurer::disable)
                
                // 🌐 Cấu hình CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // 🚪 PHÂN QUYỀN TRUY CẬP CÁC ENDPOINT
                .authorizeHttpRequests(auth -> auth
                        // ✅ CHO PHÉP TẤT CẢ (permitAll)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // CORS preflight
                        .requestMatchers("/api/login", "/api/register", "/api/create-admin").permitAll()  // Đăng nhập/đăng ký
                        .requestMatchers("/api/verify").permitAll()  // Xác minh email
                        .requestMatchers("/login/oauth2/code/**").permitAll()  // OAuth2 callback URLs
                        
                        // 📖 CHO PHÉP ĐỌC (GET) - Không cần đăng nhập
                        .requestMatchers(HttpMethod.GET, "/api/categories", "/api/food-items/**").permitAll()
                        
                        // ✏️ CHỈ ADMIN MỚI ĐƯỢC TẠO/SỬA/XÓA
                        .requestMatchers(HttpMethod.POST, "/api/categories", "/api/food-items").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/food-items/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/food-items/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/all").hasRole("ADMIN")
                        
                        // 🛒 CẦN ĐĂNG NHẬP ĐỂ TRUY CẬP
                        .requestMatchers("/api/orders/**").authenticated()
                        
                        // 📁 CHO PHÉP TRUY CẬP TÀI NGUYÊN TĨNH
                        .requestMatchers("/static/**", "/uploads/**", "/uploads/avatar/**", "/*.jpg", "/*.png", "/*.jpeg").permitAll()
                        
                        // 💬 CHO PHÉP WEBSOCKET (chat realtime)
                        .requestMatchers("/ws/**", "/topic/**", "/queue/**", "/app/**").permitAll()
                        
                        // 🔒 TẤT CẢ REQUEST KHÁC CẦN ĐĂNG NHẬP
                        .anyRequest().authenticated()
                )
                
                // 🔐 CẤU HÌNH OAUTH2 VỚI GOOGLE
                .oauth2Login(oauth2 -> oauth2
                        .successHandler(googleOAuth2SuccessHandler)  // Handler xử lý khi OAuth2 thành công
                )
                
                // ⚠️ XỬ LÝ LỖI XÁC THỰC
                .exceptionHandling(ex -> ex
                        // Lỗi chưa đăng nhập (401 Unauthorized)
                        .authenticationEntryPoint((request, response, authException) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                // API calls: trả về 401
                                response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
                            } else {
                                // Web requests: redirect về frontend
                                response.sendRedirect(frontendURL);
                            }
                        })
                        // Lỗi không có quyền (403 Forbidden)
                        .accessDeniedHandler((request, response, accessDeniedException) ->
                                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Access Denied")
                        )
                )
                
                // 📱 QUẢN LÝ SESSION
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                
                // 🔄 THIẾT LẬP AUTHENTICATION PROVIDER
                .authenticationProvider(authenticationProvider())
                
                // 🔍 THÊM JWT FILTER VÀO CHUỖI FILTER
                // JWT filter sẽ chạy TRƯỚC UsernamePasswordAuthenticationFilter
                .addFilterBefore(jwtAuthenticationTokenFilter, UsernamePasswordAuthenticationFilter.class)
                
                .build();
    }
}
