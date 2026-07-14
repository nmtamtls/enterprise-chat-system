// src/main/java/com/chatapp/backend/presence/entity/Presence.java
package com.chatapp.backend.presence.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;
import java.time.LocalDateTime;

@Entity
@Table(name = "presence")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Presence {
    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "is_online")
    @JsonProperty("isOnline") // 🔥 Bắt buộc phải có để React nhận đúng key
    private Boolean isOnline;

    @Column(name = "is_typing")
    @JsonProperty("isTyping") // 🔥 Đồng bộ với Typing Indicator
    private Boolean isTyping;

    @Column(name = "last_seen")
    private LocalDateTime lastSeen;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}