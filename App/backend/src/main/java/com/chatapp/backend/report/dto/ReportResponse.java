package com.chatapp.backend.report.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReportResponse {

    // ================= REPORT INFO =================
    private UUID id;
    private String reason;
    private String description; // Thêm field này
    private String status;
    private String reportType;  // Thêm field này
    private LocalDateTime createdAt;

    // ================= REPORTER INFO =================
    private UUID reporterId;
    private String reporterName;

    // ================= MESSAGE INFO =================
    private UUID messageId;
    private String messageContent;

    // ================= TARGET INFO (USER) =================
    private UUID targetId;      // Thêm field này
    private String targetName;  // Thêm field này

    private boolean alreadyReported;

    public ReportResponse() {
    }

    // ================= GETTERS & SETTERS =================

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public UUID getReporterId() { return reporterId; }
    public void setReporterId(UUID reporterId) { this.reporterId = reporterId; }

    public String getReporterName() { return reporterName; }
    public void setReporterName(String reporterName) { this.reporterName = reporterName; }

    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }

    public String getMessageContent() { return messageContent; }
    public void setMessageContent(String messageContent) { this.messageContent = messageContent; }

    public UUID getTargetId() { return targetId; }
    public void setTargetId(UUID targetId) { this.targetId = targetId; }

    public String getTargetName() { return targetName; }
    public void setTargetName(String targetName) { this.targetName = targetName; }

    
// Thêm getter và setter
public void setAlreadyReported(boolean alreadyReported) { this.alreadyReported = alreadyReported; }
public boolean isAlreadyReported() { return alreadyReported; }
}