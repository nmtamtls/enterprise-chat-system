// package com.chatapp.backend.report.dto;

// import java.util.UUID;

// public class CreateReportRequest {
//     private UUID messageId; // Có thể là null nếu báo cáo User
//     private UUID targetId;  // Thêm trường này để nhận ID của User/Group
//     private String reason;
//     private String description;

//     // Getter và Setter cho messageId
//     public UUID getMessageId() { return messageId; }
//     public void setMessageId(UUID messageId) { this.messageId = messageId; }

//     // Thêm Getter và Setter cho targetId
//     public UUID getTargetId() { return targetId; }
//     public void setTargetId(UUID targetId) { this.targetId = targetId; }

//     // Getter và Setter cho reason
//     public String getReason() { return reason; }
//     public void setReason(String reason) { this.reason = reason; }

//     // Getter và Setter cho description
//     public String getDescription() { return description; }
//     public void setDescription(String description) { this.description = description; }
// }


package com.chatapp.backend.report.dto;

import java.util.UUID;

public class CreateReportRequest {
    private UUID messageId;
    private UUID targetId;
    private String reason;
    private String description;
    
    // BỔ SUNG TRƯỜNG NÀY
    private String reportType; 

    // Getter và Setter cho các trường cũ...
    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }

    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // BỔ SUNG GETTER VÀ SETTER CHO reportType
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
}