package com.chatapp.backend.user.dto;

import java.util.UUID;
import java.time.LocalDateTime;

public class UserResponse {

    private UUID id;
    private String username;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;
    private String status;
    private LocalDateTime createdAt;


    // --- BỔ SUNG 2 TRƯỜNG NÀY ---
    private Boolean isUploadBlocked;
    private Boolean isChatBlocked;

    public UserResponse() {}

    public UserResponse(UUID id, String username, String email,
                        String fullName, String avatarUrl, String role, String status,LocalDateTime createdAt, Boolean isUploadBlocked, Boolean isChatBlocked) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.status = status;
        this.createdAt = createdAt;
        this.isUploadBlocked = isUploadBlocked;
        this.isChatBlocked = isChatBlocked;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsUploadBlocked() {
        return isUploadBlocked;
    }

    public void setIsUploadBlocked(Boolean isUploadBlocked) {
        this.isUploadBlocked = isUploadBlocked;
    }

    public Boolean getIsChatBlocked() {
        return isChatBlocked;
    }

    public void setIsChatBlocked(Boolean isChatBlocked) {
        this.isChatBlocked = isChatBlocked;
    }
}