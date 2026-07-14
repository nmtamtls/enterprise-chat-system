// package com.chatapp.backend.file.entity;

// import java.util.UUID;

// import jakarta.persistence.Entity;
// import jakarta.persistence.Id;
// import jakarta.persistence.Table;
// import lombok.Getter;
// import lombok.Setter;

// @Entity
// @Table(name = "files")
// @Getter
// @Setter
// public class File {

//     @Id
//     private UUID id;

//     private UUID uploaderId;

//     private String fileName;
//     private String fileUrl;
//     private String fileType;
//     private Long fileSize;
// }



package com.chatapp.backend.file.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "files")
@Getter
@Setter
public class File {

    @Id
    private UUID id;

    private UUID uploaderId;

    // Tên file gốc có thể dài, đặc biệt khi đính kèm UUID prefix
    @Column(name = "file_name", length = 255)
    private String fileName;

    // URL bao gồm cả domain MinIO + bucket + filename nên thường rất dài
    @Column(name = "file_url", length = 500)
    private String fileUrl;

    // Nguyên nhân chính: ContentType của file Office/PDF thường > 50 ký tự
    @Column(name = "file_type", length = 255)
    private String fileType;

    private Long fileSize;

    @CreationTimestamp // Tự động tạo thời gian khi insert vào DB
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}