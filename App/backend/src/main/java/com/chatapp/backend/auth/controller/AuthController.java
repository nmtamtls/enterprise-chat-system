package com.chatapp.backend.auth.controller;

import com.chatapp.backend.auth.dto.*;
import com.chatapp.backend.auth.service.AuthService;
import com.chatapp.backend.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Register success", authService.register(req))
        );
    }

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@RequestBody LoginRequest req) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Login success", authService.login(req))
        );
    }
}