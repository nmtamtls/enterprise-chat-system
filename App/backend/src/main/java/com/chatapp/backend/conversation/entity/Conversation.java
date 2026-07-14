package com.chatapp.backend.conversation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String type; // PRIVATE | GROUP

    private String name;

    @Column(name = "created_by", nullable = false)
    private UUID createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "group_avatar")
    private String groupAvatar;
}