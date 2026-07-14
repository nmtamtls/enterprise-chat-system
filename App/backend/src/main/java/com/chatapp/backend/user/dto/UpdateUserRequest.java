package com.chatapp.backend.user.dto;

public class UpdateUserRequest {

    private String fullName;
    private String avatarUrl;

    public String getFullName() {
        return fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }
}