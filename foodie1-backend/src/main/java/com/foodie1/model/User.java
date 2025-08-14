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
    private Boolean verified = false;

    @Column(name = "verification_token", length = 255)
    private String verificationToken;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Cart cart;

    // Method getter an toàn cho verified - đảm bảo không bao giờ trả về null
    public Boolean getVerified() {
        return verified != null ? verified : false;
    }

    // Method setter an toàn cho verified - đảm bảo không bao giờ set null
    public void setVerified(Boolean verified) {
        this.verified = verified != null ? verified : false;
    }

    // Method để lấy giá trị primitive boolean (an toàn cho database)
    public boolean isVerified() {
        return Boolean.TRUE.equals(verified);
    }
}
