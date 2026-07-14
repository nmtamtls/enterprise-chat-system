package com.chatapp.backend.message.entity;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "message_files")
@Getter @Setter
public class MessageFile {

    @Id
    private UUID id;

    private UUID messageId;
    private UUID fileId;
}