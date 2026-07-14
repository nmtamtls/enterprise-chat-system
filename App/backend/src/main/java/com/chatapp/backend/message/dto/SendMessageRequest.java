// package com.chatapp.backend.message.dto;

// import java.util.UUID;

// public class SendMessageRequest {

//     private UUID conversationId;
//     private UUID senderId;
//     private UUID replyToId;
//     private String content;
//     private String messageType;

//     // 🔥 File info
//     private String fileUrl;
//     private String fileName;
//     private Long fileSize;
//     private String fileType; // ⭐ THÊM MỚI
//     private String iv;
//     private Boolean encrypted;

//     public SendMessageRequest() {}

//     // ===== GETTERS =====
//     public UUID getConversationId() {
//         return conversationId;
//     }

//     public UUID getSenderId() {
//         return senderId;
//     }
//     public UUID getReplyToId() {
//         return replyToId;
//     }

//     public String getContent() {
//         return content;
//     }

//     public String getMessageType() {
//         return messageType;
//     }

//     public String getFileUrl() {
//         return fileUrl;
//     }

//     public String getFileName() {
//         return fileName;
//     }

//     public Long getFileSize() {
//         return fileSize;
//     }

//     public String getFileType() {   // ⭐ THÊM GETTER
//         return fileType;
//     }

//     public String getIv() {
//         return iv;
//     }

//     public Boolean getEncrypted() {
//         return encrypted;
//     }

//     // ===== SETTERS =====
//     public void setConversationId(UUID conversationId) {
//         this.conversationId = conversationId;
//     }

//     public void setSenderId(UUID senderId) {
//         this.senderId = senderId;
//     }

//         public void setReplyToId(UUID replyToId) {
//         this.replyToId = replyToId;
//     }


//     public void setContent(String content) {
//         this.content = content;
//     }

//     public void setMessageType(String messageType) {
//         this.messageType = messageType;
//     }

//     public void setFileUrl(String fileUrl) {
//         this.fileUrl = fileUrl;
//     }

//     public void setFileName(String fileName) {
//         this.fileName = fileName;
//     }

//     public void setFileSize(Long fileSize) {
//         this.fileSize = fileSize;
//     }

//     public void setFileType(String fileType) {   // ⭐ THÊM SETTER
//         this.fileType = fileType;
//     }

//     public void setIv(String iv) {
//     this.iv = iv;
// }

//     public void setEncrypted(Boolean encrypted) {
//         this.encrypted = encrypted;
//     }

//     @Override
//     public String toString() {
//         return "SendMessageRequest{" +
//                 "conversationId=" + conversationId +
//                 ", senderId=" + senderId +
//                 ", replyToId=" + replyToId + // ⭐ Bổ sung vào toString
//                 ", content='" + content + '\'' +
//                 ", messageType='" + messageType + '\'' +
//                 ", fileUrl='" + fileUrl + '\'' +
//                 ", fileName='" + fileName + '\'' +
//                 ", fileSize=" + fileSize +
//                 ", fileType='" + fileType + '\'' +   // ⭐ LOG THÊM
//                 ", iv='" + iv + '\'' +
//                 ", encrypted=" + encrypted +
//                 '}';
//     }
// }
package com.chatapp.backend.message.dto;

import java.util.UUID;

public class SendMessageRequest {

    private UUID conversationId;
    private UUID senderId;
    private UUID replyToId;
    private String content;
    private String messageType;

    // 🔥 FILE INFO
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private String fileType;

    // 🔐 AES ENCRYPTION INFO
    private String iv;
    private Boolean encrypted;
    private String aesKey; // ⭐ FIX QUAN TRỌNG

    public SendMessageRequest() {}

    // ===== GETTERS =====
    public UUID getConversationId() {
        return conversationId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public UUID getReplyToId() {
        return replyToId;
    }

    public String getContent() {
        return content;
    }

    public String getMessageType() {
        return messageType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public String getFileName() {
        return fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public String getIv() {
        return iv;
    }

    public Boolean getEncrypted() {
        return encrypted;
    }

    public String getAesKey() {
        return aesKey;
    }

    // ===== SETTERS =====
    public void setConversationId(UUID conversationId) {
        this.conversationId = conversationId;
    }

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public void setReplyToId(UUID replyToId) {
        this.replyToId = replyToId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setMessageType(String messageType) {
        this.messageType = messageType;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public void setIv(String iv) {
        this.iv = iv;
    }

    public void setEncrypted(Boolean encrypted) {
        this.encrypted = encrypted;
    }

    public void setAesKey(String aesKey) {
        this.aesKey = aesKey;
    }

    @Override
    public String toString() {
        return "SendMessageRequest{" +
                "conversationId=" + conversationId +
                ", senderId=" + senderId +
                ", replyToId=" + replyToId +
                ", content='" + content + '\'' +
                ", messageType='" + messageType + '\'' +
                ", fileUrl='" + fileUrl + '\'' +
                ", fileName='" + fileName + '\'' +
                ", fileSize=" + fileSize +
                ", fileType='" + fileType + '\'' +
                ", iv='" + iv + '\'' +
                ", encrypted=" + encrypted +
                ",  ='" + aesKey + '\'' + // 🔥 FIX QUAN TRỌNG
                '}';
    }
}