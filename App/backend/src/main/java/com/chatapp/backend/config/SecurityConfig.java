// package com.chatapp.backend.config;

// import com.chatapp.backend.security.jwt.JwtEntryPoint;
// import com.chatapp.backend.security.jwt.JwtFilter;
// import lombok.RequiredArgsConstructor;
// import org.springframework.context.annotation.*;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration
// @RequiredArgsConstructor
// public class SecurityConfig {

//     private final JwtFilter jwtFilter;
//     private final JwtEntryPoint jwtEntryPoint;

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

//         http
//             .csrf(csrf -> csrf.disable())
//             .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtEntryPoint))
//             .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//             .authorizeHttpRequests(auth -> auth
//                 .requestMatchers("/api/auth/**").permitAll()
//                 .requestMatchers("/ws/**").permitAll()
//                 .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
//                 .anyRequest().authenticated()
//             )
//             .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }
// }

// package com.chatapp.backend.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// public class SecurityConfig {

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

//         http
//             .csrf(csrf -> csrf.disable())
//             .cors(cors -> {}) // ✅ bật CORS
//             .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//             .authorizeHttpRequests(auth -> auth
//                 .anyRequest().permitAll() // 🔥 mở toàn bộ API
//             );

//         return http.build();
//     }
// }



// package com.chatapp.backend.config;

// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.Customizer;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;

// @Configuration
// public class SecurityConfig {

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http
//             .csrf(csrf -> csrf.disable()) // Tắt CSRF để demo
//             .cors(Customizer.withDefaults()) // ✅ Bắt buộc dùng Customizer.withDefaults() để nhận CorsConfig ở trên
//             .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//             .authorizeHttpRequests(auth -> auth
//                 .anyRequest().permitAll() // Mở toàn bộ để test, sau này bạn có thể siết lại bằng JWT sau
//             );

//         return http.build();
//     }
// }








// package com.chatapp.backend.config;

// import com.chatapp.backend.security.jwt.JwtFilter;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration
// public class SecurityConfig {

//     private final JwtFilter jwtFilter;

//     public SecurityConfig(JwtFilter jwtFilter) {
//         this.jwtFilter = jwtFilter;
//     }

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

//         http
//             .csrf(csrf -> csrf.disable())
//             .cors(cors -> {})
//             .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

// .authorizeHttpRequests(auth -> auth
//     // 🔓 PUBLIC
//     .requestMatchers("/api/auth/**").permitAll()
//     .requestMatchers("/ws/**").permitAll()
//     .requestMatchers("/api/files/**").permitAll()
//     .requestMatchers("/api/presence/**").permitAll()

//     // 🔒 ADMIN: Chỉ những link đặc biệt này mới cần quyền ADMIN
//     .requestMatchers("/api/users/all").hasRole("ADMIN") 
//     .requestMatchers("/api/admin/**").hasRole("ADMIN")
//     .requestMatchers("/api/files/all").hasRole("ADMIN")

//     // 🔒 USER: Các link thông thường thì chỉ cần LOGIN là được
//     .requestMatchers("/api/users/me").authenticated()
//     .requestMatchers("/api/users/search").authenticated()
//     .requestMatchers("/api/users/{username}").authenticated()

//     // Tất cả các yêu cầu khác phải được xác thực
//     .anyRequest().authenticated()
// )

//             // 🔥 BẮT BUỘC PHẢI CÓ
//             .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

//         return http.build();
//     }
// }









package com.chatapp.backend.config;

import com.chatapp.backend.security.jwt.JwtFilter;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.http.HttpMethod;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    // =====================================================
    // PASSWORD ENCODER
    // =====================================================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // =====================================================
    // SECURITY FILTER CHAIN
    // =====================================================

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http)
            throws Exception {

        http

            // =====================================================
            // DISABLE
            // =====================================================

            .csrf(csrf -> csrf.disable())

            .cors(cors -> {})

            // =====================================================
            // SESSION
            // =====================================================

            .sessionManagement(sess ->
                    sess.sessionCreationPolicy(
                            SessionCreationPolicy.STATELESS
                    )
            )

            // =====================================================
            // AUTHORIZE REQUESTS
            // =====================================================

            .authorizeHttpRequests(auth -> auth

                    // =====================================================
                    // PUBLIC APIs
                    // =====================================================

                    .requestMatchers("/api/auth/**")
                    .permitAll()

                    .requestMatchers("/ws/**")
                    .permitAll()

                    .requestMatchers("/topic/**")
                    .permitAll()

                    .requestMatchers("/app/**")
                    .permitAll()

                    .requestMatchers("/api/presence/**")
                    .permitAll()

                    // =====================================================
                    // PUBLIC FILE ACCESS
                    // =====================================================

                    .requestMatchers(
                            HttpMethod.GET,
                            "/api/files/download/**"
                    ).permitAll()

                    // =====================================================
                    // USER AUTHENTICATED
                    // =====================================================

                    .requestMatchers("/api/messages/**")
                    .authenticated()

                    .requestMatchers("/api/conversations/**")
                    .authenticated()

                    .requestMatchers("/api/contacts/**")
                    .authenticated()

                    .requestMatchers("/api/notifications/**")
                    .authenticated()

                    .requestMatchers("/api/settings/**")
                    .authenticated()

                    .requestMatchers("/api/files/upload")
                    .authenticated()

                    .requestMatchers("/api/users/me")
                    .authenticated()

                    .requestMatchers("/api/users/avatar")
                    .authenticated()

                    .requestMatchers("/api/users/search")
                    .authenticated()

                    .requestMatchers("/api/users/*")
                    .authenticated()

                    // .requestMatchers(HttpMethod.GET, "/api/users/*")
                    // .authenticated()

                    // .requestMatchers(HttpMethod.PUT, "/api/users/*")
                    // .authenticated()

                    // =====================================================
                    // ADMIN APIs
                    // =====================================================

                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")

                    .requestMatchers("/api/users/all")
                    .hasRole("ADMIN")

                    .requestMatchers("/api/files/all")
                    .hasRole("ADMIN")

                    .requestMatchers("/api/files/delete/**")
                    .hasRole("ADMIN")   

                    .requestMatchers("/api/messages/admin/**")
                    .hasRole("ADMIN")

                //     .requestMatchers("/api/reports/**")
                //     .hasRole("ADMIN")
                // =====================================================
// BÁO CÁO (REPORTS)
// =====================================================

// 1. Cho phép User đăng nhập gửi báo cáo
.requestMatchers(HttpMethod.POST, "/api/reports").authenticated()

// 2. Chỉ cho phép ADMIN xem và xử lý các báo cáo
.requestMatchers("/api/reports/**").hasRole("ADMIN")

                    // =====================================================
                    // SWAGGER (OPTIONAL)
                    // =====================================================

                    .requestMatchers(
                            "/swagger-ui/**",
                            "/v3/api-docs/**"
                    ).permitAll()

                    // =====================================================
                    // EVERYTHING ELSE
                    // =====================================================

                    .anyRequest()
                    .authenticated()
            )

            // =====================================================
            // JWT FILTER
            // =====================================================

            .addFilterBefore(
                    jwtFilter,
                    UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}