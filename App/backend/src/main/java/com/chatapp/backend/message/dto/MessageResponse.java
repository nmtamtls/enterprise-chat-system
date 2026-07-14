


// package com.chatapp.backend.message.dto;

// import java.time.LocalDateTime;
// import java.util.UUID;

// import lombok.Getter;
// import lombok.Setter;
// import lombok.NoArgsConstructor;
// import lombok.AllArgsConstructor;

// @Getter
// @Setter
// @NoArgsConstructor
// public class MessageResponse {

//     private UUID id;
//     private UUID conversationId;
//     private UUID senderId;

//     // 🔥 UI info
//     private String senderName;
//     private String senderAvatar;

//     private String content;
//     private String messageType;
//     private LocalDateTime createdAt;
//     private LocalDateTime updatedAt;

//     // 🔥 FILE (optional)
//     private String fileUrl;
//     private String fileName;
//     private Long fileSize;

//     private String iv;
//     private String aesKey;
//     private Boolean encrypted;
//     private String fileType;

//     // 🔥 STATUS
//     private String status;

//     // 🔥 PINNED INFO (BỔ SUNG)
//     private Boolean isPinned;
//     private LocalDateTime pinnedAt;

//     // 🔥 REPLY INFO
//     private RepliedMessageInfo repliedMessage;

//     @Getter
//     @Setter
//     @AllArgsConstructor
//     @NoArgsConstructor
//     public static class RepliedMessageInfo {
//         private UUID id;
//         private String senderName;
//         private String content;
//     }

//     // ================= FULL CONSTRUCTOR =================
//     public MessageResponse(
//             UUID id,
//             UUID conversationId,
//             UUID senderId,
//             String senderName,
//             String senderAvatar,
//             String content,
//             String messageType,
//             LocalDateTime createdAt,
//             LocalDateTime updatedAt,
//             String fileUrl,
//             String fileName,
//             long fileSize,
//             String fileType,
//             String iv,
//             String aesKey,
//             Boolean encrypted,
//             String status,
//             Boolean isPinned,
//             LocalDateTime pinnedAt,
//             RepliedMessageInfo repliedMessage
//     ) {
//         this.id = id;
//         this.conversationId = conversationId;
//         this.senderId = senderId;
//         this.senderName = senderName;
//         this.senderAvatar = senderAvatar;
//         this.content = content;
//         this.messageType = messageType;
//         this.createdAt = createdAt;
//         this.updatedAt = updatedAt;

//         this.fileUrl = fileUrl;
//         this.fileName = fileName;
//         this.fileSize = fileSize;

//         this.fileType = fileType;
//         this.iv = iv;
//         this.aesKey = aesKey;
//         this.encrypted = encrypted;

//         this.status = status;
//         this.isPinned = isPinned;
//         this.pinnedAt = pinnedAt;
//         this.repliedMessage = repliedMessage;
//     }

//     // ================= CONSTRUCTOR CŨ =================
//     public MessageResponse(
//             UUID id,
//             UUID conversationId,
//             UUID senderId,
//             String senderName,
//             String senderAvatar,
//             String content,
//             String messageType,
//             LocalDateTime createdAt) {

//         this.id = id;
//         this.conversationId = conversationId;
//         this.senderId = senderId;
//         this.senderName = senderName;
//         this.senderAvatar = senderAvatar;
//         this.content = content;
//         this.messageType = messageType;
//         this.createdAt = createdAt;
//         this.updatedAt = createdAt;

//         this.fileUrl = null;
//         this.fileName = null;
//         this.fileSize = 0L;
//         this.iv = null;
//         this.aesKey = null;
//         this.encrypted = false;
//         this.status = "sent";
//         this.isPinned = false;
//         this.pinnedAt = null;
//         this.repliedMessage = null;
//     }

//     // ================= GETTERS/SETTERS BỔ SUNG =================
//     public String getFileType() { return fileType; }
//     public void setFileType(String fileType) { this.fileType = fileType; }

//     public String getIv() { return iv; }
//     public void setIv(String iv) { this.iv = iv; }

//     public Boolean getEncrypted() { return encrypted; }
//     public void setEncrypted(Boolean encrypted) { this.encrypted = encrypted; }

//     public String getAesKey() { return aesKey; }
//     public void setAesKey(String aesKey) { this.aesKey = aesKey; }

//     public Boolean getIsPinned() { return isPinned; }
//     public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }

//     public LocalDateTime getPinnedAt() { return pinnedAt; }
//     public void setPinnedAt(LocalDateTime pinnedAt) { this.pinnedAt = pinnedAt; }
// }



package com.chatapp.backend.message.dto;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List; // 🔥 BỔ SUNG IMPORT
import java.util.Map;  // 🔥 BỔ SUNG IMPORT

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
public class MessageResponse {

    private UUID id;
    private UUID conversationId;
    private UUID senderId;

    // 🔥 UI info
    private String senderName;
    private String senderAvatar;

    private String content;
    private String messageType;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // 🔥 FILE (optional)
    private String fileUrl;
    private String fileName;
    private Long fileSize;

    private String iv;
    private String aesKey;
    private Boolean encrypted;
    private String fileType;

    // 🔥 STATUS
    private String status;

    // 🔥 PINNED INFO (BỔ SUNG)
    private Boolean isPinned;
    private LocalDateTime pinnedAt;

    // 🔥 REPLY INFO
    private RepliedMessageInfo repliedMessage;

    // 🔥 MENTIONS INFO (BỔ SUNG ĐỂ HIGHLIGHT TÊN)
    private List<Map<String, Object>> mentions; 

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RepliedMessageInfo {
        private UUID id;
        private String senderName;
        private String content;
    }

    // ================= FULL CONSTRUCTOR =================
    public MessageResponse(
            UUID id,
            UUID conversationId,
            UUID senderId,
            String senderName,
            String senderAvatar,
            String content,
            String messageType,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            String fileUrl,
            String fileName,
            long fileSize,
            String fileType,
            String iv,
            String aesKey,
            Boolean encrypted,
            String status,
            Boolean isPinned,
            LocalDateTime pinnedAt,
            RepliedMessageInfo repliedMessage,
            List<Map<String, Object>> mentions // 🔥 BỔ SUNG THAM SỐ NÀY
    ) {
        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;

        this.fileUrl = fileUrl;
        this.fileName = fileName;
        this.fileSize = fileSize;

        this.fileType = fileType;
        this.iv = iv;
        this.aesKey = aesKey;
        this.encrypted = encrypted;

        this.status = status;
        this.isPinned = isPinned;
        this.pinnedAt = pinnedAt;
        this.repliedMessage = repliedMessage;
        
        this.mentions = mentions; // 🔥 GÁN GIÁ TRỊ MỚI TAG TÊN
    }

    // ================= CONSTRUCTOR CŨ =================
    public MessageResponse(
            UUID id,
            UUID conversationId,
            UUID senderId,
            String senderName,
            String senderAvatar,
            String content,
            String messageType,
            LocalDateTime createdAt) {

        this.id = id;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderAvatar = senderAvatar;
        this.content = content;
        this.messageType = messageType;
        this.createdAt = createdAt;
        this.updatedAt = createdAt;

        this.fileUrl = null;
        this.fileName = null;
        this.fileSize = 0L;
        this.iv = null;
        this.aesKey = null;
        this.encrypted = false;
        this.status = "sent";
        this.isPinned = false;
        this.pinnedAt = null;
        this.repliedMessage = null;
        
        this.mentions = null; // 🔥 GÁN MẶC ĐỊNH LÀ NULL CHO CONSTRUCTOR CŨ
    }

    // ================= GETTERS/SETTERS BỔ SUNG =================
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }

    public Boolean getEncrypted() { return encrypted; }
    public void setEncrypted(Boolean encrypted) { this.encrypted = encrypted; }

    public String getAesKey() { return aesKey; }
    public void setAesKey(String aesKey) { this.aesKey = aesKey; }

    public Boolean getIsPinned() { return isPinned; }
    public void setIsPinned(Boolean isPinned) { this.isPinned = isPinned; }

    public LocalDateTime getPinnedAt() { return pinnedAt; }
    public void setPinnedAt(LocalDateTime pinnedAt) { this.pinnedAt = pinnedAt; }
    
    
    public List<Map<String, Object>> getMentions() { return mentions; }
    public void setMentions(List<Map<String, Object>> mentions) { this.mentions = mentions; }
}