

package com.chatapp.backend.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationResponse {

    private UUID id;

    private String type; // PRIVATE / GROUP

    private String name;

    private UUID createdBy;

    private LocalDateTime createdAt;

    // chat list
    private String lastMessage;

    private LocalDateTime lastMessageTime;

    //  unread/sent
    private long unreadCount;

    // group avatar
    private String groupAvatar;

    // 🔥 Bổ sung thêm 2 trường này
    private long memberCount;
    private List<String> memberNames;
}