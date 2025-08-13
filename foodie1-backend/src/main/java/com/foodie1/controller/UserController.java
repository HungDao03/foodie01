package com.foodie1.controller;

import com.foodie1.dto.request.UserUpdateRequest;
import com.foodie1.dto.response.UserResponse;
import com.foodie1.model.PaymentMethod;
import com.foodie1.model.User;
import com.foodie1.service.file.FileStorageService;
import com.foodie1.service.user.IUserService;
import com.foodie1.dto.mapper.EntityDtoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private IUserService userService;

    @Autowired
    private EntityDtoMapper mapper;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping("/all")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.findAll();
        List<UserResponse> userResponses = users.stream()
                .map(mapper::toUserResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(userResponses);
    }

    @PutMapping("/toggle-verified/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> toggleUserVerified(@PathVariable Long id) {
        User user = userService.findById(id);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }

        // getVerified() đã được đảm bảo an toàn, không bao giờ trả về null
        user.setVerified(!user.getVerified());
        userService.save(user);
        return ResponseEntity.ok(" Trạng thái tài khoản đã được cập nhật thành công.");
    }

    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toUserResponse(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateUserProfile(@Valid @RequestBody UserUpdateRequest req) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User currentUser = userService.findByUsername(username);
        if (currentUser == null) {
            return ResponseEntity.notFound().build();
        }

        currentUser.setFullName(req.getFullName());
        currentUser.setEmail(req.getEmail());
        currentUser.setPhoneNumber(req.getPhoneNumber());
        currentUser.setAddress(req.getAddress());
        currentUser.setAvatar(req.getAvatar());

        // Xử lý paymentMethod nếu có
        if (req.getPaymentMethod() != null && !req.getPaymentMethod().isBlank()) {
            try {
                currentUser.setPaymentMethod(PaymentMethod.valueOf(req.getPaymentMethod().toUpperCase()));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body("Phương thức thanh toán không hợp lệ. Chỉ chấp nhận: COD hoặc ONLINE.");
            }
        }

        User savedUser = userService.save(currentUser);
        return ResponseEntity.ok(mapper.toUserResponse(savedUser));
    }

    @PostMapping("/avatar")
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.findByUsername(username);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            // Xoá avatar cũ nếu có
            if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                String avatarFileName = Paths.get(user.getAvatar()).getFileName().toString();
                fileStorageService.deleteFile(avatarFileName, "avatar");
            }

            // Lưu avatar mới
            String newFileName = fileStorageService.saveFile(file, "avatar");
            user.setAvatar(newFileName);
            User savedUser = userService.save(user);

            return ResponseEntity.ok().body(newFileName);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Không thể upload file: " + e.getMessage());
        }
    }
}
