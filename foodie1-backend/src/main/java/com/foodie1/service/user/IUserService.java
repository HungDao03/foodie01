package com.foodie1.service.user;


import com.foodie1.model.User;
import com.foodie1.service.IGenericService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Optional;

public interface IUserService extends IGenericService<User> {
    UserDetails loadUserByUsername(String username);
    User findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);
    User registerGoogleUser(String email, OAuth2User oAuth2User); // sửa lại dòng này
    Optional<User> findByVerificationToken(String token);

}
