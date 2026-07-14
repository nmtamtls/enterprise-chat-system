package com.chatapp.backend.auth.dto;

public class AuthResponse {

    private String token;
    private String id;        // 👈 String
    private String username;
    private String role;

    public AuthResponse() {}

    // 👇 FIX: UUID → String
    public AuthResponse(String token, String id, String username, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.role = role;
    }

    // ===== GETTER =====
    public String getToken() {
        return token;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    // ===== SETTER =====
    public void setToken(String token) {
        this.token = token;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setRole(String role) {
        this.role = role;
    }
}