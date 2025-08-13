package com.foodie1;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@SpringBootApplication
@EnableTransactionManagement
public class Foodie1Application {

    public static void main(String[] args) {
        System.out.println("Base URL: " + System.getenv("baseUrl")); // Log ra biến môi trường
        SpringApplication.run(Foodie1Application.class, args);
    }
    

}
