package com.chatapp.backend.report.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reporter_id")
    private UUID reporterId;

    // message_id có thể null khi báo cáo User
    @Column(name = "message_id", nullable = true) 
    private UUID messageId;

    // ID người dùng bị báo cáo
    @Column(name = "target_id")
    private UUID targetId;

    // Loại báo cáo: "MESSAGE" hoặc "USER"
    @Column(name = "report_type", length = 20)
    private String reportType; 

    // Mô tả chi tiết vấn đề
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Lý do báo cáo
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false, length = 20)
    private String status = "pending";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "pending";
        }
    }
}