package com.chatapp.backend.message.dto;

import java.util.UUID;

public class ReactionResponse {

    private UUID messageId;
    private UUID userId;
    private String emoji;
    private String action;

    public ReactionResponse() {
    }

    public ReactionResponse(UUID messageId, UUID userId, String emoji, String action) {
        this.messageId = messageId;
        this.userId = userId;
        this.emoji = emoji;
        this.action = action;
    }

    public UUID getMessageId() {
        return messageId;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getAction() {
        return action;
    }

    public void setMessageId(UUID messageId) {
        this.messageId = messageId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public void setAction(String action) {
        this.action = action;
    }
}