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

@RestController
public class AuthController {

    private final AuthenticationManager authenticationManager;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private IUserService userService;

    @Autowired
    private IRoleService roleService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private EmailService emailService;

   @Value("${frontend.url}")
    private String frontendURL;

    public AuthController(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/api/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtService.generateTokenLogin(authentication);
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User currentUser = userService.findByUsername(user.getUsername());
            return ResponseEntity.ok(new JwtResponse(
                    currentUser.getId(),
                    jwt,
                    userDetails.getUsername(),
                    userDetails.getUsername(),
                    currentUser.getFullName(),
                    userDetails.getAuthorities()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Tên đăng nhập hoặc mật khẩu không đúng");
        }
    }

    @PostMapping("/api/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserRegisterRequest registerRequest, BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();

        // 1. Kiểm tra validate từ @Valid
        if (bindingResult.hasErrors()) {
            bindingResult.getFieldErrors().forEach(error ->
                    errors.put(error.getField(), error.getDefaultMessage())
            );
        }


        // 2. Kiểm tra trùng username
        if (userService.findByUsername(registerRequest.getUsername()) != null) {
            errors.put("username", "Tên đăng nhập đã tồn tại!");
        }

        // 2.1. Kiểm tra trùng email
        if (userService.findByEmail(registerRequest.getEmail()).isPresent()) {
            errors.put("email", "Email đã tồn tại!");
        }

        // 2.2. Kiểm tra trùng số điện thoại
        if (userService.findByPhoneNumber(registerRequest.getPhoneNumber()).isPresent()) {
            errors.put("phoneNumber", "Số điện thoại đã tồn tại!");
        }

        // 3. Kiểm tra domain email ảo
        String email = registerRequest.getEmail();
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase();
        List<String> blacklistedDomains = List.of(
                "tempmail.com", "10minutemail.com", "mailinator.com",
                "guerrillamail.com", "throwawaymail.com", "yopmail.com"
        );
        if (blacklistedDomains.contains(domain)) {
            errors.put("email", "Email không hợp lệ. Vui lòng sử dụng email thật.");
        }

        // 4. Nếu có lỗi, trả về luôn
        if (!errors.isEmpty()) {
            return ResponseEntity.badRequest().body(errors);
        }

        // 5. Tạo User
        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(email);
        user.setFullName(registerRequest.getFullName());
        user.setPhoneNumber(registerRequest.getPhoneNumber());
        user.setAddress(registerRequest.getAddress());
        user.setVerified(false);

        // 6. Gán vai trò
        Role userRole = roleService.findByName("ROLE_USER");
        if (userRole == null) {
            errors.put("role", "Lỗi: Không tìm thấy vai trò người dùng!");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errors);
        }
        user.setRoles(Set.of(userRole));

        // 7. Gửi email xác minh và lưu
        try {
            String token = emailService.sendVerificationEmail(user);
            user.setVerificationToken(token);
            userService.save(user);

            return ResponseEntity.ok("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
        } catch (Exception e) {
            errors.put("email", "Không thể gửi email xác minh. Vui lòng kiểm tra lại địa chỉ email.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errors);
        }
    }

    @GetMapping("/api/verify")
    public ResponseEntity<String> verifyUser(@RequestParam String token) {
        Optional<User> userOpt = userService.findByVerificationToken(token);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setVerified(true);
            user.setVerificationToken(null); // Xóa token sau khi xác minh
            userService.save(user);
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(frontendURL + "verify-success"));
            return new ResponseEntity<>("Tài khoản đã được xác minh.", headers, HttpStatus.FOUND);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Link xác minh không hợp lệ.");
        }
    }
}

