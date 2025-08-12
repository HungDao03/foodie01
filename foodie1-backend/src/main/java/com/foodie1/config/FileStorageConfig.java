package com.foodie1.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình để truy cập file tĩnh từ thư mục "uploads" như ảnh món ăn hoặc avatar
 * Truy cập qua URL: http://localhost:8080/uploads/food/abc.jpg hoặc /uploads/avatar/xyz.png
 */
@Configuration
public class FileStorageConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapping ảnh món ăn
        registry.addResourceHandler("/uploads/food/**")
                .addResourceLocations("file:uploads/food/");

        // Mapping ảnh avatar
        registry.addResourceHandler("/uploads/avatar/**")
                .addResourceLocations("file:uploads/avatar/");

    }
}
