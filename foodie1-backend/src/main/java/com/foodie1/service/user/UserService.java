package com.foodie1.service.user;



import com.foodie1.config.DTO.UserPrinciple;
import com.foodie1.config.service.EmailService;
import com.foodie1.model.Role;
import com.foodie1.model.User;
import com.foodie1.repo.UserRepo;
import com.foodie1.service.role.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService implements IUserService, UserDetailsService {
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private RoleService roleService;
    @Autowired
    private EmailService emailService;

    @Override
    public List<User> findAll() {
        return userRepo.findAll();
    }

    @Override
    public User findById(Long id) {
        return userRepo.findById(id).orElse(null);
    }

    @Override
    public User save(User user) {
        return userRepo.save(user);
    }

    @Override
    public void delete(User user) {
        userRepo.delete(user);
    }

    @Override
    public User findByUsername(String username) {
        return userRepo.findByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(username);
        return UserPrinciple.build(user);
    }
    @Override
    public Optional<User> findByEmail(String email) {
        return userRepo.findByEmail(email);
    }

    @Override
    public Optional<User> findByPhoneNumber(String phoneNumber) {
        return userRepo.findByPhoneNumber(phoneNumber);
    }

    // Phương thức đăng ký người dùng mới từ thông tin Google OAuth2
    @Override
    public User registerGoogleUser(String email, OAuth2User oAuth2User) {
        User user = new User();
        user.setUsername(email);
        user.setEmail(email);
        user.setPassword("");
        user.setFullName(oAuth2User.getAttribute("name"));
        user.setPhoneNumber("");
        user.setAddress("");
        user.setAvatar("");
        user.setVerified(false);

        Role roleUser = roleService.findByName("ROLE_USER");
        user.setRoles(Set.of(roleUser));

        // Lưu người dùng trước để tạo ID
        User savedUser = userRepo.save(user);
        // Gửi email xác minh và gán token
        String verificationToken = emailService.sendVerificationEmail(savedUser);
        savedUser.setVerificationToken(verificationToken);
        // Lưu lại người dùng với token
        return userRepo.save(savedUser);
    }

    // Phương thức tìm người dùng dựa trên token xác minh
    @Override
    public Optional<User> findByVerificationToken(String token) {
        return userRepo.findByVerificationToken(token); // Truy vấn cơ sở dữ liệu để tìm người dùng với token
    }

}

