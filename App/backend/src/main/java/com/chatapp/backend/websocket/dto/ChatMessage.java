// package com.chatapp.backend.websocket.dto;

// import java.util.UUID;

// public class ChatMessage {

//     private UUID conversationId;
//     private UUID senderId;
//     private String content;

//     // ===== FILE =====
//     private String fileUrl;
//     private String fileName;
//     private Long fileSize;
//     private String fileType;     // image/png, application/pdf...
//     private String messageType;  // TEXT | IMAGE | VIDEO | FILE

//     // 🔐 ENCRYPTION (FIX QUAN TRỌNG)
//     private String iv;
//     private Boolean encrypted;
//     private String aesKey; // ⭐ THÊM MỚI (QUAN TRỌNG NHẤT)

//     // ===== STATUS =====
//     private UUID messageId;
//     private UUID readerId;

//     private Boolean isTyping;
//     private String status; // sent | delivered | read

//     private String fullName;

//     // ================= CONSTRUCTORS =================

//     public ChatMessage() {
//     }

//     public ChatMessage(UUID conversationId, UUID senderId, String content) {
//         this.conversationId = conversationId;
//         this.senderId = senderId;
//         this.content = content;
//     }

//     // ================= GETTER / SETTER =================

//     public UUID getConversationId() {
//         return conversationId;
//     }

//     public void setConversationId(UUID conversationId) {
//         this.conversationId = conversationId;
//     }

//     public UUID getSenderId() {
//         return senderId;
//     }

//     public void setSenderId(UUID senderId) {
//         this.senderId = senderId;
//     }

//     public String getContent() {
//         return content;
//     }

//     public void setContent(String content) {
//         this.content = content;
//     }

//     // ===== FILE =====

//     public String getFileUrl() {
//         return fileUrl;
//     }

//     public void setFileUrl(String fileUrl) {
//         this.fileUrl = fileUrl;
//     }

//     public String getFileName() {
//         return fileName;
//     }

//     public void setFileName(String fileName) {
//         this.fileName = fileName;
//     }

//     public Long getFileSize() {
//         return fileSize;
//     }

//     public void setFileSize(Long fileSize) {
//         this.fileSize = fileSize;
//     }

//     public String getFileType() {
//         return fileType;
//     }

//     public void setFileType(String fileType) {
//         this.fileType = fileType;
//     }

//     public String getMessageType() {
//         return messageType;
//     }

//     public void setMessageType(String messageType) {
//         this.messageType = messageType;
//     }

//     // ===== ENCRYPT =====

//     public String getIv() {
//         return iv;
//     }

//     public void setIv(String iv) {
//         this.iv = iv;
//     }

//     public Boolean getEncrypted() {
//         return encrypted;
//     }

//     public void setEncrypted(Boolean encrypted) {
//         this.encrypted = encrypted;
//     }

//     public String getAesKey() {
//         return aesKey;
//     }

//     public void setAesKey(String aesKey) {
//         this.aesKey = aesKey;
//     }

//     // ===== STATUS =====

//     public UUID getMessageId() {
//         return messageId;
//     }

//     public void setMessageId(UUID messageId) {
//         this.messageId = messageId;
//     }

//     public UUID getReaderId() {
//         return readerId;
//     }

//     public void setReaderId(UUID readerId) {
//         this.readerId = readerId;
//     }

//     public Boolean getIsTyping() {
//         return isTyping;
//     }

//     public void setIsTyping(Boolean isTyping) {
//         this.isTyping = isTyping;
//     }

//     public String getStatus() {
//         return status;
//     }

//     public void setStatus(String status) {
//         this.status = status;
//     }

//     public String getFullName() {
//         return fullName;
//     }

//     public void setFullName(String fullName) {
//         this.fullName = fullName;
//     }

//     // ================= toString =================

//     @Override
//     public String toString() {
//         return "ChatMessage{" +
//                 "conversationId=" + conversationId +
//                 ", senderId=" + senderId +
//                 ", messageId=" + messageId +
//                 ", readerId=" + readerId +
//                 ", content='" + content + '\'' +
//                 ", messageType='" + messageType + '\'' +
//                 ", status='" + status + '\'' +
//                 ", isTyping=" + isTyping +
//                 ", iv='" + iv + '\'' +
//                 ", encrypted=" + encrypted +
//                 ", aesKey='" + aesKey + '\'' + // 🔥 FIX QUAN TRỌNG
//                 '}';
//     }
// }


// package com.chatapp.backend.websocket.dto;

// import java.util.UUID;

// public class ChatMessage {

//     private UUID conversationId;
//     private UUID senderId;
//     private String content;

//     // ===== FILE =====
//     private String fileUrl;
//     private String fileName;
//     private Long fileSize;
//     private String fileType;     // image/png, application/pdf...
//     private String messageType;  // TEXT | IMAGE | VIDEO | FILE

//     // 🔐 ENCRYPTION
//     private String iv;
//     private Boolean encrypted;
//     private String aesKey;

//     // ===== STATUS =====
//     private UUID messageId;
//     private UUID readerId;

//     private Boolean isTyping;
//     private String status; // sent | delivered | read

//     private String fullName;

//     // ===== UNREAD =====
//     private Long unreadCount;

//     // ================= CONSTRUCTORS =================

//     public ChatMessage() {
//     }

//     public ChatMessage(UUID conversationId, UUID senderId, String content) {
//         this.conversationId = conversationId;
//         this.senderId = senderId;
//         this.content = content;
//     }

//     // ================= GETTER / SETTER =================

//     public UUID getConversationId() {
//         return conversationId;
//     }

//     public void setConversationId(UUID conversationId) {
//         this.conversationId = conversationId;
//     }

//     public UUID getSenderId() {
//         return senderId;
//     }

//     public void setSenderId(UUID senderId) {
//         this.senderId = senderId;
//     }

//     public String getContent() {
//         return content;
//     }

//     public void setContent(String content) {
//         this.content = content;
//     }

//     // ===== FILE =====

//     public String getFileUrl() {
//         return fileUrl;
//     }

//     public void setFileUrl(String fileUrl) {
//         this.fileUrl = fileUrl;
//     }

//     public String getFileName() {
//         return fileName;
//     }

//     public void setFileName(String fileName) {
//         this.fileName = fileName;
//     }

//     public Long getFileSize() {
//         return fileSize;
//     }

//     public void setFileSize(Long fileSize) {
//         this.fileSize = fileSize;
//     }

//     public String getFileType() {
//         return fileType;
//     }

//     public void setFileType(String fileType) {
//         this.fileType = fileType;
//     }

//     public String getMessageType() {
//         return messageType;
//     }

//     public void setMessageType(String messageType) {
//         this.messageType = messageType;
//     }

//     // ===== ENCRYPT =====

//     public String getIv() {
//         return iv;
//     }

//     public void setIv(String iv) {
//         this.iv = iv;
//     }

//     public Boolean getEncrypted() {
//         return encrypted;
//     }

//     public void setEncrypted(Boolean encrypted) {
//         this.encrypted = encrypted;
//     }

//     public String getAesKey() {
//         return aesKey;
//     }

//     public void setAesKey(String aesKey) {
//         this.aesKey = aesKey;
//     }

//     // ===== STATUS =====

//     public UUID getMessageId() {
//         return messageId;
//     }

//     public void setMessageId(UUID messageId) {
//         this.messageId = messageId;
//     }

//     public UUID getReaderId() {
//         return readerId;
//     }

//     public void setReaderId(UUID readerId) {
//         this.readerId = readerId;
//     }

//     public Boolean getIsTyping() {
//         return isTyping;
//     }

//     public void setIsTyping(Boolean isTyping) {
//         this.isTyping = isTyping;
//     }

//     public String getStatus() {
//         return status;
//     }

//     public void setStatus(String status) {
//         this.status = status;
//     }

//     public String getFullName() {
//         return fullName;
//     }

//     public void setFullName(String fullName) {
//         this.fullName = fullName;
//     }

//     // ===== UNREAD =====

//     public Long getUnreadCount() {
//         return unreadCount;
//     }

//     public void setUnreadCount(Long unreadCount) {
//         this.unreadCount = unreadCount;
//     }

//     // ================= toString =================

//     @Override
//     public String toString() {
//         return "ChatMessage{" +
//                 "conversationId=" + conversationId +
//                 ", senderId=" + senderId +
//                 ", messageId=" + messageId +
//                 ", readerId=" + readerId +
//                 ", content='" + content + '\'' +
//                 ", messageType='" + messageType + '\'' +
//                 ", status='" + status + '\'' +
//                 ", isTyping=" + isTyping +
//                 ", unreadCount=" + unreadCount +
//                 ", iv='" + iv + '\'' +
//                 ", encrypted=" + encrypted +
//                 ", aesKey='" + aesKey + '\'' +
//                 '}';
//     }
// }




package com.chatapp.backend.websocket.dto;

import java.util.UUID;

public class ChatMessage {

    private UUID conversationId;
    private UUID senderId;
    private String content;

    // ===== FILE =====
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;     // image/png, application/pdf...
    private String messageType;  // TEXT | IMAGE | VIDEO | FILE

    // 🔐 ENCRYPTION
    private String iv;
    private Boolean encrypted;
    private String aesKey;

    // ===== STATUS =====
    private UUID messageId;
    private UUID readerId;

    // ===== REACTION =====
    private String emoji;
    private String action;

    private Boolean isTyping;
    private String status; // sent | delivered | read

    private String fullName;

    // ===== UNREAD =====
    private Long unreadCount;

    // ================= CONSTRUCTORS =================

    public ChatMessage() {
    }

    public ChatMessage(UUID conversationId, UUID senderId, String content) {
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.content = content;
    }

    // ================= GETTER / SETTER =================

    public UUID getConversationId() { return conversationId; }
    public void setConversationId(UUID conversationId) { this.conversationId = conversationId; }

    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    // ===== FILE =====

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public String getMessageType() { return messageType; }
    public void setMessageType(String messageType) { this.messageType = messageType; }

    // ===== ENCRYPT =====

    public String getIv() { return iv; }
    public void setIv(String iv) { this.iv = iv; }

    public Boolean getEncrypted() { return encrypted; }
    public void setEncrypted(Boolean encrypted) { this.encrypted = encrypted; }

    public String getAesKey() { return aesKey; }
    public void setAesKey(String aesKey) { this.aesKey = aesKey; }

    // ===== STATUS =====

    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }

    public UUID getReaderId() { return readerId; }
    public void setReaderId(UUID readerId) { this.readerId = readerId; }

    // ===== REACTION =====

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public Boolean getIsTyping() { return isTyping; }
    public void setIsTyping(Boolean isTyping) { this.isTyping = isTyping; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    // ===== UNREAD =====

    public Long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(Long unreadCount) { this.unreadCount = unreadCount; }

    // ================= toString =================

    @Override
    public String toString() {
        return "ChatMessage{" +
                "conversationId=" + conversationId +
                ", senderId=" + senderId +
                ", messageId=" + messageId +
                ", readerId=" + readerId +
                ", content='" + content + '\'' +
                ", messageType='" + messageType + '\'' +
                ", status='" + status + '\'' +
                ", emoji='" + emoji + '\'' +
                ", action='" + action + '\'' +
                ", isTyping=" + isTyping +
                ", unreadCount=" + unreadCount +
                ", iv='" + iv + '\'' +
                ", encrypted=" + encrypted +
                ", aesKey='" + aesKey + '\'' +
                '}';
    }
}