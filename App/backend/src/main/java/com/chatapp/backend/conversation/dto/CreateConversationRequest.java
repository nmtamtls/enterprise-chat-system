

package com.chatapp.backend.conversation.dto;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateConversationRequest {

    private String type; // PRIVATE / GROUP

    private UUID createdBy;

    private List<UUID> memberIds;

    // GROUP NAME
    private String name;

    // GROUP AVATAR
    private String groupAvatar;
}