package com.chatapp.backend.user.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    // ================= ID =================
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "UUID", updatable = false, nullable = false)
    private UUID id;

    // ================= BASIC INFO =================
    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String fullName;

    private String avatarUrl;

    @Column(nullable = false, length = 20)
    private String status = "active"; //

    @Column(nullable = false)
    private String role;

    // ================= CONSTRUCTOR =================
    public User() {}

    // ================= GETTER =================
    public UUID getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getFullName() {
        return fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    // ================= SETTER =================
    public void setId(UUID id) {
        this.id = id;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public void setRole(String role) {
        this.role = role;
    }

    @Column(name = "created_at", updatable = false, insertable = false)
    private LocalDateTime createdAt;

    // Chỉ cần Getter là đủ (vì Database tự tạo bằng DEFAULT CURRENT_TIMESTAMP)
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Nếu bạn muốn hiển thị cả ngày cập nhật thì thêm cả trường này:
    @Column(name = "updated_at", insertable = false)
    private LocalDateTime updatedAt;

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}