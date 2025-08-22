package com.foodie1.config.service;

import com.foodie1.config.DTO.UserPrinciple;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

/**
 * 🔐 JWT SERVICE
 * 
 * Service này xử lý tất cả các thao tác liên quan đến JWT:
 * - Tạo JWT token
 * - Validate JWT token
 * - Trích xuất thông tin từ JWT
 * 
 * CẤU HÌNH:
 * - Secret key: 64 ký tự hex (256 bit)
 * - Thuật toán: HS256 (HMAC SHA-256)
 * - Thời hạn: 24 giờ (86,400,000 ms)
 */
@Service
public class JwtService {
    
    // 🔑 SECRET KEY: 64 ký tự hex = 256 bit
    // Đây là key bí mật để ký và xác thực JWT
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    
    // ⏰ THỜI HẠN JWT: 24 giờ (86,400,000 milliseconds)
    private static final long EXPIRE_TIME = 86400000L;

    /**
     * 🎯 TẠO JWT TOKEN TỪ AUTHENTICATION OBJECT
     * 
     * @param authentication Authentication object từ Spring Security
     * @return JWT token string
     */
    public String generateTokenLogin(Authentication authentication) {
        // Lấy UserPrinciple từ authentication
        UserPrinciple userPrincipal = (UserPrinciple) authentication.getPrincipal();
        
        // Tạo JWT với username
        return Jwts.builder()
                .setSubject(userPrincipal.getUsername())  // Subject = username
                .setIssuedAt(new Date())                 // Thời điểm tạo
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))  // Thời hạn
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)  // Ký với secret key
                .compact();  // Tạo JWT string
    }
    
    /**
     * 🎯 TẠO JWT TOKEN TỪ USER DETAILS
     * 
     * @param userDetails UserDetails object
     * @return JWT token string
     */
    public String generateTokenLogin(UserDetails userDetails) {
        return generateToken(userDetails.getUsername());
    }
    
    /**
     * 🎯 TẠO JWT TOKEN TỪ USERNAME
     * 
     * @param username Username của user
     * @return JWT token string
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)                    // Subject = username
                .setIssuedAt(new Date())                 // Thời điểm tạo
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRE_TIME))  // Thời hạn
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)  // Ký với secret key
                .compact();  // Tạo JWT string
    }

    /**
     * 🔑 TẠO SIGNING KEY TỪ SECRET KEY
     * 
     * @return Key object để ký JWT
     */
    private Key getSignInKey() {
        // Decode secret key từ hex string thành byte array
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        // Tạo HMAC SHA-256 key
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * ✅ VALIDATE JWT TOKEN
     * 
     * Kiểm tra xem JWT token có hợp lệ không:
     * - Signature có đúng không
     * - Token có đúng format không
     * - Token có hết hạn chưa
     * - Token có được hỗ trợ không
     * 
     * @param authToken JWT token string
     * @return true nếu hợp lệ, false nếu không hợp lệ
     */
    public boolean validateJwtToken(String authToken) {
        try {
            // Parse và validate JWT token
            Jwts.parserBuilder()
                    .setSigningKey(getSignInKey())  // Sử dụng secret key để verify
                    .build()
                    .parseClaimsJws(authToken);     // Parse JWT và verify signature
            
            System.out.println("✅ JWT token hợp lệ");
            return true;
            
        } catch (SecurityException e) {
            // ❌ Lỗi signature không đúng
            System.out.println("❌ Invalid JWT signature -> Message: " + e.getMessage());
        } catch (MalformedJwtException e) {
            // ❌ Lỗi format JWT không đúng
            System.out.println("❌ Invalid JWT token -> Message: " + e.getMessage());
        } catch (ExpiredJwtException e) {
            // ❌ Lỗi JWT đã hết hạn
            System.out.println("❌ Expired JWT token -> Message: " + e.getMessage());
        } catch (UnsupportedJwtException e) {
            // ❌ Lỗi JWT không được hỗ trợ
            System.out.println("❌ Unsupported JWT token -> Message: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            // ❌ Lỗi JWT claims string rỗng
            System.out.println("❌ JWT claims string is empty -> Message: " + e.getMessage());
        }
        
        return false;
    }

    /**
     * 🔍 TRÍCH XUẤT USERNAME TỪ JWT TOKEN
     * 
     * @param token JWT token string
     * @return Username từ JWT subject
     */
    public String getUsernameFromJwtToken(String token) {
        // Parse JWT token để lấy claims
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSignInKey())  // Sử dụng secret key
                .build()
                .parseClaimsJws(token)          // Parse JWT
                .getBody();                     // Lấy claims body

        // Trả về subject (username)
        return claims.getSubject();
    }
}
