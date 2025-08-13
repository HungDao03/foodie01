package com.foodie1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class Foodie1Application {

    public static void main(String[] args) {
        System.out.println("Base URL: " + System.getenv("baseUrl")); // Log ra biến môi trường
        System.out.println("GOOGLE_CLIENT_ID: " + System.getenv("GOOGLE_CLIENT_ID"));
        System.out.println("GOOGLE_CLIENT_SECRET: " + System.getenv("GOOGLE_CLIENT_SECRET"));
        System.out.println("Frontend URL from env: " + System.getenv("FRONTEND_URL"));
        SpringApplication.run(Foodie1Application.class, args);
    }
    

}
