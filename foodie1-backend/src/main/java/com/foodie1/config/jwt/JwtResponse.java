package com.foodie1.config.jwt;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

@Data
@Getter
@Setter
public class JwtResponse {
    private Long id;
    private String token;
    private String type = "Bearer";
    private String username;
    private String name;
    private String fullName;

    private final Collection<? extends GrantedAuthority> authorities;

    public JwtResponse(Long id, String token, String username, String name,String fullName, Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.token = token;
        this.username = username;
        this.name = name;
        this.authorities = authorities;
        this.fullName = fullName;
    }


}