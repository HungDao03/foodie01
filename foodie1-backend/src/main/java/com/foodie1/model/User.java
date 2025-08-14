package com.foodie1.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Data
@Table(name = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "full_name", nullable = false)
    private String fullName;
    
    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;
    
    @Column(nullable = false)
    private String address;

    @Column(name = "avatar")
    private String avatar;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles", // bảng trung gian
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    @Column(name = "is_verified", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Integer verified = 0;  // Mặc định = 0 (false)

    @Column(name = "verification_token", length = 255, columnDefinition = "VARCHAR(255)")
    private String verificationToken;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    // Method getter cho Integer - null → 0
    public Integer getVerified() {
        return verified != null ? verified : 0;
    }

    // Method setter cho Integer - null → 0
    public void setVerified(Integer verified) {
        this.verified = verified != null ? verified : 0;
    }

    // Method để kiểm tra boolean - null → false
    public boolean isVerified() {
        return verified != null && verified.equals(1);
    }

    // Method để set trực tiếp boolean - true → 1, false → 0
    public void setVerified(boolean verified) {
        this.verified = verified ? 1 : 0;
    }
}
