package com.foodie1.config.jwt;

import com.foodie1.config.service.JwtService;
import com.foodie1.service.user.IUserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * 🔍 JWT AUTHENTICATION TOKEN FILTER
 * 
 * Filter này chạy TRƯỚC mọi request để xác thực JWT token
 * 
 * LUỒNG XỬ LÝ:
 * 1. Nhận request từ client
 * 2. Trích xuất JWT token từ header Authorization
 * 3. Validate JWT token
 * 4. Nếu hợp lệ -> load user details và set authentication context
 * 5. Nếu không hợp lệ -> request tiếp tục mà không có authentication
 * 
 * VỊ TRÍ TRONG FILTER CHAIN:
 * - Chạy TRƯỚC UsernamePasswordAuthenticationFilter
 * - Được cấu hình trong SecurityConfig
 */
@Component
public class JwtAuthenticationTokenFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;      // Service xác thực và tạo JWT

    @Autowired
    private IUserService userService;   // Service load user details

    /**
     * 🚀 PHƯƠNG THỨC CHÍNH: Xử lý mọi HTTP request
     * 
     * @param request HTTP request từ client
     * @param response HTTP response
     * @param filterChain Chuỗi filter tiếp theo
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // ✅ BƯỚC 1: BỎ QUA REQUEST OPTIONS (CORS PREFLIGHT)
        // CORS preflight request không cần xác thực JWT
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            System.out.println("🔄 Bỏ qua CORS preflight request (OPTIONS)");
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }

        // 🔍 BƯỚC 2: XỬ LÝ JWT TOKEN (nếu không phải OPTIONS)
        String jwt = getJwtFromRequest(request);
        
        if (jwt != null && jwtService.validateJwtToken(jwt)) {
            // 🎯 JWT hợp lệ -> Xác thực thành công
            System.out.println("✅ JWT token hợp lệ, xác thực user");
            
            // Lấy username từ JWT token
            String username = jwtService.getUsernameFromJwtToken(jwt);
            System.out.println("👤 Username từ JWT: " + username);
            
            // Load user details từ database
            UserDetails userDetails = userService.loadUserByUsername(username);
            
            // Tạo authentication token với user details và authorities
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userDetails,           // Principal (user details)
                    null,                  // Credentials (không cần password)
                    userDetails.getAuthorities()  // Authorities (roles)
            );
            
            // Set additional details
            authentication.setDetails(userDetails);
            
            // 🔐 THIẾT LẬP AUTHENTICATION CONTEXT
            // Điều này cho phép Spring Security biết user đã đăng nhập
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            System.out.println("🔐 Đã thiết lập authentication context cho user: " + username);
            
        } else if (jwt != null) {
            // ❌ JWT không hợp lệ
            System.out.println("❌ JWT token không hợp lệ hoặc đã hết hạn");
        } else {
            // ℹ️ Không có JWT token
            System.out.println("ℹ️ Không có JWT token trong request");
        }

        // ✅ BƯỚC 3: TIẾP TỤC XỬ LÝ REQUEST
        // Luôn gọi filterChain.doFilter() để request tiếp tục
        // Nếu không có authentication -> Spring Security sẽ xử lý theo cấu hình
        filterChain.doFilter(request, response);
    }

    /**
     * 🔍 TRÍCH XUẤT JWT TOKEN TỪ HTTP REQUEST
     * 
     * @param request HTTP request
     * @return JWT token hoặc null nếu không có
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        // Lấy header Authorization
        String authorization = request.getHeader("Authorization");
        
        if (authorization != null && authorization.startsWith("Bearer ")) {
            // Format: "Bearer <token>"
            // Trả về phần token (bỏ "Bearer " ở đầu)
            String token = authorization.replace("Bearer ", "");
            System.out.println("🔑 Trích xuất JWT token: " + token.substring(0, Math.min(20, token.length())) + "...");
            return token;
        }
        
        return null;
    }
}
