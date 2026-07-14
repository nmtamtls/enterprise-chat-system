

package com.chatapp.backend.websocket.controller;

import com.chatapp.backend.message.dto.MessageResponse;
import com.chatapp.backend.message.dto.ReactionRequest;
import com.chatapp.backend.message.dto.ReactionResponse;
import com.chatapp.backend.message.service.MessageService;
import com.chatapp.backend.presence.entity.Presence;
import com.chatapp.backend.presence.service.PresenceService;
import com.chatapp.backend.websocket.dto.ChatMessage;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Controller
public class ChatWebSocketController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PresenceService presenceService;

    public ChatWebSocketController(
            MessageService messageService,
            SimpMessagingTemplate messagingTemplate,
            PresenceService presenceService
    ) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.presenceService = presenceService;
    }

    // ================= SEND MESSAGE =================
    @MessageMapping("/chat.send")
    public void send(ChatMessage chatMessage) {

        try {

            // Lưu DB
            MessageResponse saved = messageService.saveFromSocket(chatMessage);

            // Gửi realtime message
            messagingTemplate.convertAndSend(
                    "/topic/conversations/" + chatMessage.getConversationId(),
                    saved
            );

            // Broadcast trạng thái SENT
            Map<String, Object> status = new HashMap<>();
            status.put("messageId", saved.getId());
            status.put("status", "sent");
            status.put("senderId", saved.getSenderId());

            messagingTemplate.convertAndSend(
                    "/topic/status",
                    status
            );

            System.out.println("Message sent: " + saved.getId());

        } catch (Exception e) {
            System.err.println("Lỗi gửi tin nhắn: " + e.getMessage());
        }
    }

    // ================= REACT MESSAGE =================
// ================= REACT MESSAGE =================
@MessageMapping("/chat.react")
public void react(@Payload ChatMessage message) {
    System.out.println("DEBUG: Nhận emoji: " + message.getEmoji() + " cho ID: " + message.getMessageId());
    try {
        // Kiểm tra dữ liệu bắt buộc
        if (message.getMessageId() == null || message.getSenderId() == null || message.getEmoji() == null) {
            return;
        }

        // 1. Chuẩn bị Request
        ReactionRequest request = new ReactionRequest();
        request.setMessageId(message.getMessageId());
        request.setUserId(message.getSenderId());
        request.setEmoji(message.getEmoji());
        request.setAction(message.getAction()); // "ADD" hoặc "REMOVE"

        // 2. Gọi Service xử lý DB
        // Giả định messageService.reactMessage trả về thông tin cập nhật (reaction count, v.v.)
        ReactionResponse response = messageService.reactMessage(request);

        // 3. Broadcast tới các thành viên trong hội thoại
        // Cần truyền conversationId để client biết reaction này thuộc về tin nhắn nào trong group nào
        messagingTemplate.convertAndSend(
                "/topic/conversations/" + message.getConversationId() + "/reactions",
                response
        );

        System.out.println("Reaction updated: " + message.getMessageId() + " by " + message.getSenderId());

    } catch (Exception e) {
        System.err.println("Lỗi xử lý reaction: " + e.getMessage());
    }
}


// @MessageMapping("/chat.react")
// public void react(Map<String, String> payload) {

//     try {

//         String messageIdStr = payload.get("messageId");
//         String userIdStr = payload.get("userId");
//         String emoji = payload.get("emoji");

//         if (messageIdStr != null && userIdStr != null && emoji != null) {

//             UUID messageId = UUID.fromString(messageIdStr);
//             UUID userId = UUID.fromString(userIdStr);

//             ReactionRequest request = new ReactionRequest();
//             request.setMessageId(messageId);
//             request.setUserId(userId);
//             request.setEmoji(emoji);

//             ReactionResponse response =
//                     messageService.reactMessage(request);

//             messagingTemplate.convertAndSend(
//                     "/topic/reactions",
//                     response
//             );

//             System.out.println("Reaction updated: " + messageId);
//         }

//     } catch (Exception e) {
//         System.err.println("Lỗi xử lý reaction: " + e.getMessage());
//     }
// }

// ================= EDIT MESSAGE (BỔ SUNG) =================
    @MessageMapping("/chat.edit")
    public void edit(Map<String, String> payload) {

        try {
            String messageIdStr = payload.get("messageId");
            String conversationIdStr = payload.get("conversationId");
            String newContent = payload.get("content");
            String senderIdStr = payload.get("senderId");

            if (messageIdStr != null && newContent != null && conversationIdStr != null) {
                
                UUID messageId = UUID.fromString(messageIdStr);
                UUID conversationId = UUID.fromString(conversationIdStr);
                UUID senderId = senderIdStr != null ? UUID.fromString(senderIdStr) : null;

                // Cập nhật DB qua Service (Chuẩn chữ ký hàm: messageId, senderId, newContent)
                MessageResponse updatedMessage = messageService.editMessage(messageId, senderId, newContent);

                // Broadcast tin nhắn đã cập nhật về phòng chat để Frontend render nội dung mới realtime
                messagingTemplate.convertAndSend(
                        "/topic/conversations/" + conversationId,
                        updatedMessage
                );

                System.out.println("Message edited: " + messageId);
            }

        } catch (Exception e) {
            System.err.println("Lỗi xử lý chỉnh sửa tin nhắn: " + e.getMessage());
        }
    }
    // ================= REPLY MESSAGE (BỔ SUNG) =================
    @MessageMapping("/chat.reply")
    public void reply(Map<String, String> payload) {
        try {
            String conversationIdStr = payload.get("conversationId");
            String senderIdStr = payload.get("senderId");
            String replyToIdStr = payload.get("replyToId");
            String content = payload.get("content");

            if (conversationIdStr != null && senderIdStr != null && replyToIdStr != null && content != null) {
                UUID conversationId = UUID.fromString(conversationIdStr);
                UUID senderId = UUID.fromString(senderIdStr);
                UUID replyToId = UUID.fromString(replyToIdStr);

                // 1. Gọi service để xử lý logic lưu tin nhắn reply
                // Phương thức này sẽ lưu theo định dạng [REPLY:ID]Content và trả về MessageResponse đã đầy đủ thông tin
                MessageResponse savedReply = messageService.replyMessage(conversationId, senderId, replyToId, content);

                // 2. Broadcast tin nhắn trả lời tới những người trong cuộc hội thoại
                messagingTemplate.convertAndSend(
                        "/topic/conversations/" + conversationId,
                        savedReply
                );

                // 3. (Tùy chọn) Gửi broadcast trạng thái SENT
                Map<String, Object> status = new HashMap<>();
                status.put("messageId", savedReply.getId());
                status.put("status", "sent");
                status.put("senderId", savedReply.getSenderId());
                messagingTemplate.convertAndSend("/topic/status", status);

                System.out.println("Reply message sent: " + savedReply.getId());
            }
        } catch (Exception e) {
            System.err.println("Lỗi xử lý gửi tin nhắn reply: " + e.getMessage());
        }
    }
    // ================= MARK AS READ =================
    @MessageMapping("/chat.read")
    public void markAsRead(Map<String, String> payload) {

        try {

            String messageIdStr = payload.get("messageId");
            String readerIdStr = payload.get("readerId");

            if (messageIdStr != null && readerIdStr != null) {

                UUID messageId = UUID.fromString(messageIdStr);
                UUID readerId = UUID.fromString(readerIdStr);

                // update DB
                messageService.markAsRead(messageId, readerId);

                // realtime broadcast
                Map<String, Object> status = new HashMap<>();
                status.put("messageId", messageId);
                status.put("status", "read");
                status.put("readerId", readerId);

                messagingTemplate.convertAndSend(
                        "/topic/status",
                        status
                );

                System.out.println("Message read: " + messageId);
            }

        } catch (Exception e) {
            System.err.println("Lỗi xử lý markAsRead: " + e.getMessage());
        }
    }

    // ================= MARK AS DELIVERED =================
    @MessageMapping("/chat.delivered")
    public void markAsDelivered(Map<String, String> payload) {

        try {

            String messageIdStr = payload.get("messageId");
            String userIdStr = payload.get("userId");

            if (messageIdStr != null && userIdStr != null) {

                UUID messageId = UUID.fromString(messageIdStr);
                UUID userId = UUID.fromString(userIdStr);

                // update DB
                messageService.markAsDelivered(messageId, userId);

                // realtime broadcast
                Map<String, Object> status = new HashMap<>();
                status.put("messageId", messageId);
                status.put("status", "delivered");
                status.put("userId", userId);

                messagingTemplate.convertAndSend(
                        "/topic/status",
                        status
                );

                System.out.println("Message delivered: " + messageId);
            }

        } catch (Exception e) {
            System.err.println("Lỗi xử lý markAsDelivered: " + e.getMessage());
        }
    }

    // ================= USER ONLINE =================
    @MessageMapping("/user.online")
    public void userOnline(
            Map<String, String> payload,
            SimpMessageHeaderAccessor headerAccessor
    ) {

        try {

            String idStr = payload.get("userId");

            if (idStr != null) {

                UUID userId = UUID.fromString(idStr);

                if (headerAccessor.getSessionAttributes() != null) {
                    headerAccessor.getSessionAttributes().put("userId", userId);
                }

                Presence p = presenceService.setOnline(userId);

                messagingTemplate.convertAndSend(
                        "/topic/presence",
                        p
                );

                System.out.println("User online: " + userId);
            }

        } catch (Exception e) {
            System.err.println("Lỗi xử lý online: " + e.getMessage());
        }
    }

    // ================= USER OFFLINE =================
    @MessageMapping("/user.offline")
    public void userOffline(Map<String, String> payload) {

        try {

            String idStr = payload.get("userId");

            if (idStr != null) {

                UUID userId = UUID.fromString(idStr);

                Presence p = presenceService.setOffline(userId);

                messagingTemplate.convertAndSend(
                        "/topic/presence",
                        p
                );

                System.out.println("User offline: " + userId);
            }

        } catch (Exception e) {
            System.err.println("Lỗi xử lý offline: " + e.getMessage());
        }
    }

    // ================= USER TYPING =================
    @MessageMapping("/user.typing")
    public void typing(ChatMessage msg) {

        try {

            if (msg.getSenderId() == null) return;

            Presence p = presenceService.setTyping(
                    msg.getSenderId(),
                    true
            );

            messagingTemplate.convertAndSend(
                    "/topic/typing/" + msg.getConversationId(),
                    p
            );

        } catch (Exception e) {
            System.err.println("Lỗi typing: " + e.getMessage());
        }
    }

    // ================= STOP TYPING =================
    @MessageMapping("/user.stopTyping")
    public void stopTyping(ChatMessage msg) {

        try {

            if (msg.getSenderId() == null) return;

            Presence p = presenceService.setTyping(
                    msg.getSenderId(),
                    false
            );

            messagingTemplate.convertAndSend(
                    "/topic/typing/" + msg.getConversationId(),
                    p
            );

        } catch (Exception e) {
            System.err.println("Lỗi stop typing: " + e.getMessage());
        }
    }
}