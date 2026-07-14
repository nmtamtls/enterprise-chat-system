// package com.chatapp.backend.message.entity;

// import jakarta.persistence.*;

// @Entity
// @Table(name = "message_status")
// public class MessageStatus {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     private String messageId;

//     private String userId;

//     private String status; // SENT / DELIVERED / READ

//     public MessageStatus() {}

//     public Long getId() {
//         return id;
//     }

//     public String getMessageId() {
//         return messageId;
//     }

//     public String getUserId() {
//         return userId;
//     }

//     public String getStatus() {
//         return status;
//     }

//     public void setId(Long id) {
//         this.id = id;
//     }

//     public void setMessageId(String messageId) {
//         this.messageId = messageId;
//     }

//     public void setUserId(String userId) {
//         this.userId = userId;
//     }

//     public void setStatus(String status) {
//         this.status = status;
//     }
// }






package com.chatapp.backend.message.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "message_status")
public class MessageStatus {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "message_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID messageId;

    @Column(name = "user_id", nullable = false)
    @JdbcTypeCode(SqlTypes.UUID)
    private UUID userId;

    @Column(length = 20, nullable = false)
    private String status; // 'sent', 'delivered', 'read'

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MessageStatus() {}

    public MessageStatus(UUID messageId, UUID userId, String status) {
        this.messageId = messageId;
        this.userId = userId;
        this.setStatus(status); 
        this.updatedAt = LocalDateTime.now();
    }

    // Tự động cập nhật thời gian mỗi khi thêm mới hoặc chỉnh sửa record
    @PreUpdate
    @PrePersist
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        // Đảm bảo status luôn là viết thường để khớp với CHECK constraint trong SQL
        if (this.status != null) {
            this.status = this.status.toLowerCase();
        }
    }

    // --- GETTERS AND SETTERS ---
    
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public String getStatus() { return status; }
    public void setStatus(String status) {
        this.status = (status != null) ? status.toLowerCase() : null;
    }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // 🔥 ĐÃ XÓA: Phương thức setReadAt gây lỗi Unimplemented
    // Thay vào đó, bạn hãy sử dụng setUpdatedAt(LocalDateTime.now()) ở Service
}