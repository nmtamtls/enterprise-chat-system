// package com.chatapp.backend.message.entity;

// import jakarta.persistence.*;
// import java.time.LocalDateTime;
// import java.util.UUID;

// @Entity
// @Table(
//     name = "message_reactions",
//     uniqueConstraints = {
//         @UniqueConstraint(columnNames = {"message_id", "user_id"})
//     }
// )
// public class MessageReaction {

//     @Id
//     @GeneratedValue(strategy = GenerationType.UUID)
//     private UUID id;

//     @Column(name = "message_id", nullable = false)
//     private UUID messageId;

//     @Column(name = "user_id", nullable = false)
//     private UUID userId;

//     @Column(nullable = false, length = 20)
//     private String emoji;

//     @Column(name = "created_at", nullable = false)
//     private LocalDateTime createdAt;

//     public MessageReaction() {
//         this.createdAt = LocalDateTime.now();
//     }

//     public MessageReaction(UUID messageId, UUID userId, String emoji) {
//         this.messageId = messageId;
//         this.userId = userId;
//         this.emoji = emoji;
//         this.createdAt = LocalDateTime.now();
//     }

//     public UUID getId() {
//         return id;
//     }

//     public UUID getMessageId() {
//         return messageId;
//     }

//     public void setMessageId(UUID messageId) {
//         this.messageId = messageId;
//     }

//     public UUID getUserId() {
//         return userId;
//     }

//     public void setUserId(UUID userId) {
//         this.userId = userId;
//     }

//     public String getEmoji() {
//         return emoji;
//     }

//     public void setEmoji(String emoji) {
//         this.emoji = emoji;
//     }

//     public LocalDateTime getCreatedAt() {
//         return createdAt;
//     }

//     public void setCreatedAt(LocalDateTime createdAt) {
//         this.createdAt = createdAt;
//     }
// }



package com.chatapp.backend.message.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "message_reactions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"message_id", "user_id"})
    }
)
public class MessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO) // Dùng AUTO để Hibernate tự quyết định (thường ổn định hơn cho UUID)
    private UUID id;

    @Column(name = "message_id", nullable = false)
    private UUID messageId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // BỔ SUNG: columnDefinition để ép kiểu utf8mb4 cho MySQL
    @Column(nullable = false, length = 255, columnDefinition = "VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
    private String emoji;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // BỔ SUNG: Hook để đảm bảo createdAt luôn có giá trị khi save
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public MessageReaction() {
        this.createdAt = LocalDateTime.now();
    }

    public MessageReaction(UUID messageId, UUID userId, String emoji) {
        this.messageId = messageId;
        this.userId = userId;
        this.emoji = emoji;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters giữ nguyên...
    public UUID getId() { return id; }
    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }
    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}