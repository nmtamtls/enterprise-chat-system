package com.chatapp.backend.message.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "messages")
public class Message {

    @Id
    @Column(name = "id")
    private UUID id;

    @Column(name = "conversation_id")
    private UUID conversationId;

    @Column(name = "sender_id")
    private UUID senderId;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "message_type")
    private String messageType;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    // --- CÁC TRƯỜNG MỚI CHO TÍNH NĂNG GHIM ---
    @Column(name = "is_pinned")
    private Boolean isPinned = false;

    @Column(name = "pinned_at")
    private LocalDateTime pinnedAt;
    // ----------------------------------------

    @Formula("(SELECT ms.status FROM message_status ms WHERE ms.message_id = id ORDER BY ms.updated_at DESC LIMIT 1)")
    private String status;

    // --- CONSTRUCTORS ---
    public Message() {}

    // --- GETTERS & SETTERS ---

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getConversationId() { return conversationId; }
    public void setConversationId(UUID conversationId) { this.conversationId = conversationId; }

    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getIsDeleted() { return isDeleted; }
    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }

    public LocalDateTime getPinnedAt() { return pinnedAt; }
    public void setPinnedAt(LocalDateTime pinnedAt) { this.pinnedAt = pinnedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}