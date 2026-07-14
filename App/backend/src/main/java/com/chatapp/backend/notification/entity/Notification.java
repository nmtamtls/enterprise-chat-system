package com.chatapp.backend.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID userId;

    private String title;

    private String content;

    private String type;

    @Builder.Default
    private boolean isRead = false;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}