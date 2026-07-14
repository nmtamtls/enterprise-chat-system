package com.chatapp.backend.presence.dto;

import java.util.UUID;

public class PresenceDTO {

    private UUID userId;
    private boolean online;
    private boolean typing;

    public PresenceDTO(UUID userId, boolean online, boolean typing) {
        this.userId = userId;
        this.online = online;
        this.typing = typing;
    }

    public UUID getUserId() { return userId; }
    public boolean isOnline() { return online; }
    public boolean isTyping() { return typing; }
}