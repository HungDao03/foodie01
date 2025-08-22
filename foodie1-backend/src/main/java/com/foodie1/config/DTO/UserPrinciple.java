package com.foodie1.config.DTO;

import com.foodie1.model.Role;
import com.foodie1.model.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.io.Serial;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * 🔐 USER PRINCIPLE - IMPLEMENTATION CỦA USERDETAILS
 * 
 * Class này là cầu nối giữa User model và Spring Security
 * Spring Security sử dụng UserDetails để xác thực và phân quyền
 * 
 * CHỨC NĂNG:
 * - Chuyển đổi User model thành UserDetails
 * - Cung cấp thông tin xác thực cho Spring Security
 * - Quản lý authorities (roles) của user
 * - Kiểm tra trạng thái tài khoản (verified, locked, expired)
 */
public class UserPrinciple implements UserDetails {

    @Serial
    private static final long serialVersionUID = 1L;

    private final User user;  // User object từ model

    private final String username;      // Username để đăng nhập
    private final String password;      // Password đã được mã hóa
    private final Collection<? extends GrantedAuthority> authorities;  // Danh sách quyền (roles)

    /**
     * 🏗️ CONSTRUCTOR
     * 
     * @param username Username
     * @param password Password đã mã hóa
     * @param user User object
     * @param authorities Danh sách quyền
     */
    public UserPrinciple(String username, String password,User user, Collection<? extends GrantedAuthority> authorities) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.user = user;
    }

    /**
     * 🔄 PHƯƠNG THỨC STATIC: Chuyển đổi User model thành UserPrinciple
     * 
     * Đây là phương thức chính để tạo UserPrinciple từ User model
     * 
     * @param user User object từ database
     * @return UserPrinciple object cho Spring Security
     */
    public static UserPrinciple build(User user) {
        // Tạo danh sách authorities từ roles của user
        List<GrantedAuthority> author = new ArrayList<>();
        
        // Chuyển đổi mỗi Role thành SimpleGrantedAuthority
        for (Role role : user.getRoles()) {
            // Format: "ROLE_ADMIN", "ROLE_USER"
            author.add(new SimpleGrantedAuthority(role.getName()));
        }
        
        // Tạo UserPrinciple với thông tin từ User model
        return new UserPrinciple(
            user.getUsername(),     // Username
            user.getPassword(),     // Password đã mã hóa
            user,                   // User object
            author                  // Authorities (roles)
        );
    }
    
    /**
     * 🔑 TRẢ VỀ DANH SÁCH QUYỀN (AUTHORITIES)
     * Spring Security sử dụng để phân quyền truy cập
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    /**
     * 🔐 TRẢ VỀ PASSWORD ĐÃ MÃ HÓA
     * Spring Security sử dụng để verify password
     */
    @Override
    public String getPassword() {
        return password;
    }

    /**
     * 👤 TRẢ VỀ USERNAME
     * Spring Security sử dụng để identify user
     */
    @Override
    public String getUsername() {
        return username;
    }

    /**
     * ✅ KIỂM TRA TÀI KHOẢN CÓ HẾT HẠN KHÔNG
     * Luôn trả về true (không có cơ chế hết hạn)
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * 🔓 KIỂM TRA TÀI KHOẢN CÓ BỊ KHÓA KHÔNG
     * Luôn trả về true (không có cơ chế khóa tài khoản)
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * 🔑 KIỂM TRA CREDENTIALS CÓ HẾT HẠN KHÔNG
     * Luôn trả về true (không có cơ chế hết hạn password)
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * ✅ KIỂM TRA TÀI KHOẢN CÓ ĐƯỢC KÍCH HOẠT KHÔNG
     * 
     * Đây là điểm quan trọng nhất:
     * - Chỉ trả về true khi user đã xác minh email (isVerified = true)
     * - Nếu chưa xác minh -> trả về false -> không thể đăng nhập
     * 
     * @return true nếu user đã xác minh, false nếu chưa xác minh
     */
    @Override
    public boolean isEnabled() {
        // isVerified() trả về primitive boolean, không bao giờ null
        return user.isVerified();
    }
    
    /**
     * 🆔 LẤY USER ID
     * Tiện ích để lấy ID của user
     */
    public Long getId() {
        return user.getId();
    }
    
    /**
     * 👤 LẤY USER OBJECT
     * Tiện ích để truy cập toàn bộ thông tin user
     */
    public User getUser() {
        return user;
    }
}
    