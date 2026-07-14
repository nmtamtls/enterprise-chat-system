package com.chatapp.backend.auth.service;

import com.chatapp.backend.auth.dto.*;
import com.chatapp.backend.security.jwt.JwtUtil;
import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ================= REGISTER =================
    public AuthResponse register(RegisterRequest req) {

        if (userRepository.existsByUsername(req.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setFullName(req.getFullName());
        user.setPasswordHash(passwordEncoder.encode(req.getPassword()));
        user.setRole("USER");

        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername());

        // ✅ FIX: UUID -> String
        return new AuthResponse(
                token,
                user.getId().toString(),   // 👈 FIX CHỖ NÀY
                user.getUsername(),
                user.getRole()
        );
    }

    // ================= LOGIN =================
    public AuthResponse login(LoginRequest req) {

        User user = userRepository.findByUsername(req.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getUsername());

        // ✅ FIX: UUID -> String
        return new AuthResponse(
                token,
                user.getId().toString(),   // 👈 FIX CHỖ NÀY
                user.getUsername(),
                user.getRole()
        );
    }
}