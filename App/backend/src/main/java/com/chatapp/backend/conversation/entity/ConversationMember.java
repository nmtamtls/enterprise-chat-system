package com.chatapp.backend.conversation.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "conversation_members")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class ConversationMember {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "conversation_id")
    private UUID conversationId;

    @Column(name = "user_id")
    private UUID userId;

    private String role; // owner/admin/member
    private String status; // active/left/removed

    private LocalDateTime joinedAt = LocalDateTime.now();
}