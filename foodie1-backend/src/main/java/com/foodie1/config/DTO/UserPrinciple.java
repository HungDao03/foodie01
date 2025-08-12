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

public class UserPrinciple implements UserDetails {

    @Serial
    private static final long serialVersionUID = 1L;

    private final User user; // Assuming you have a User field in this class

    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrinciple(String username, String password,User user, Collection<? extends GrantedAuthority> authorities) {
        this.username = username;
        this.password = password;
        this.authorities = authorities;
        this.user = user;
    }

//    chuyen tu user trong model -> User co kha nang phan quyen UserPrinciple
    public static UserPrinciple build(User user) {
//        quyen de xac thuc -> GrantedAuthority
        List<GrantedAuthority> author = new ArrayList<>();
        for (Role role : user.getRoles()) {
            author.add(new SimpleGrantedAuthority(role.getName()));
        }
        return new UserPrinciple(user.getUsername(), user.getPassword(), user, author);
    }
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return user.isVerified(); // Assuming 'user' is a field in this class
    }
}
    