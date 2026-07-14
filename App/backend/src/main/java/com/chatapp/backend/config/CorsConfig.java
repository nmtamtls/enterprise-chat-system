package com.chatapp.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {

                registry.addMapping("/**")
                        .allowedOrigins("*") // 🔥 cho hết để test
                        .allowedMethods("*")
                        .allowedHeaders("*");
            }
        };
    }
}






// package com.chatapp.backend.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.CorsRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// @Configuration
// public class CorsConfig {

//     @Bean
//     public WebMvcConfigurer corsConfigurer() {
//         return new WebMvcConfigurer() {
//             @Override
//             public void addCorsMappings(CorsRegistry registry) {
//                 registry.addMapping("/**")
//                         .allowedOrigins("*") // Cho phép tất cả các nguồn (Ngrok, VS Code Tunnel, v.v.)
//                         .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
//                         .allowedHeaders("*")
//                         .exposedHeaders("Authorization") // Nếu bạn dùng JWT, cần thêm dòng này
//                         .allowCredentials(false);
//             }
//         };
//     }
// }