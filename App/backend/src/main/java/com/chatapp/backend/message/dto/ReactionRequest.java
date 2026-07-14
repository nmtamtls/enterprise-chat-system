package com.chatapp.backend.message.dto;

import java.util.UUID;

public class ReactionRequest {

    private UUID messageId;
    private UUID userId;
    private String emoji;
    private String action; // <--- Thêm trường này

    public ReactionRequest() {
    }

    public ReactionRequest(UUID messageId, UUID userId, String emoji, String action) {
        this.messageId = messageId;
        this.userId = userId;
        this.emoji = emoji;
        this.action = action; // <--- Cập nhật constructor
    }

    // ================= GETTER / SETTER =================

    public UUID getMessageId() {
        return messageId;
    }

    public void setMessageId(UUID messageId) {
        this.messageId = messageId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    // <--- Thêm các phương thức này
    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }
}