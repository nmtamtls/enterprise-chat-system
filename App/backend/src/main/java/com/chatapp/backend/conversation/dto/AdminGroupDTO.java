package com.chatapp.backend.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class AdminGroupDTO {
    private ConversationResponse conversation;
    private int memberCount;
    private List<String> memberNames;
    private String creatorName;
}