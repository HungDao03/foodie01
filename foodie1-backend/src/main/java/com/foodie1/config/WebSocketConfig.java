package com.foodie1.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${frontend.url}")
    private String frontendURL;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint cho WebSocket native
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendURL); // Chỉ cho phép frontend URL
        
        // Endpoint cho SockJS fallback
        registry.addEndpoint("/ws")
                .setAllowedOrigins(frontendURL)
                .withSockJS(); // Hỗ trợ SockJS fallback
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Cấu hình message broker
        registry.enableSimpleBroker("/topic", "/queue", "/user");
        
        // Prefix cho client gửi message đến server
        registry.setApplicationDestinationPrefixes("/app");
        
        // Prefix cho user-specific messages
        registry.setUserDestinationPrefix("/user");
    }
}
