// package com.chatapp.backend.websocket.service;

// import java.util.Map;
// import java.util.UUID;

// import org.springframework.context.event.EventListener;
// import org.springframework.messaging.simp.SimpMessagingTemplate;
// import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
// import org.springframework.stereotype.Service;
// import org.springframework.web.socket.messaging.SessionConnectEvent;
// import org.springframework.web.socket.messaging.SessionDisconnectEvent;

// import com.chatapp.backend.presence.dto.PresenceDTO;
// import com.chatapp.backend.presence.service.PresenceService;

// @Service
// public class WebSocketService {

//     private final PresenceService presenceService;
//     private final SimpMessagingTemplate messagingTemplate;

//     public WebSocketService(PresenceService presenceService,
//                             SimpMessagingTemplate messagingTemplate) {
//         this.presenceService = presenceService;
//         this.messagingTemplate = messagingTemplate;
//     }

//     // ================= CONNECT =================
//     @EventListener
//     public void handleConnect(SessionConnectEvent event) {

//         StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

//         String userIdStr = accessor.getFirstNativeHeader("userId");

//         if (userIdStr != null) {

//             UUID userId = UUID.fromString(userIdStr);

//             // 🔥 LƯU VÀO SESSION (QUAN TRỌNG NHẤT)
//             Map<String, Object> session = accessor.getSessionAttributes();
//             if (session != null) {
//                 session.put("userId", userId);
//             }

//             presenceService.setOnline(userId);

//             messagingTemplate.convertAndSend(
//                     "/topic/presence",
//                     new PresenceDTO(userId, true, false)
//             );
//         }
//     }

//     // ================= DISCONNECT =================
//     @EventListener
//     public void handleDisconnect(SessionDisconnectEvent event) {

//         StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

//         Map<String, Object> session = accessor.getSessionAttributes();

//         if (session != null && session.containsKey("userId")) {

//             UUID userId = (UUID) session.get("userId");

//             presenceService.setOffline(userId);

//             messagingTemplate.convertAndSend(
//                     "/topic/presence",
//                     new PresenceDTO(userId, false, false)
//             );
//         }
//     }
// }




package com.chatapp.backend.websocket.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import com.chatapp.backend.presence.dto.PresenceDTO;
import com.chatapp.backend.presence.service.PresenceService;
import com.chatapp.backend.message.service.MessageService; // 🔥 Import MessageService

@Service
public class WebSocketService {

    private final PresenceService presenceService;
    private final MessageService messageService; // 🔥 Inject MessageService
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(PresenceService presenceService,
                            MessageService messageService, // Bổ sung vào constructor
                            SimpMessagingTemplate messagingTemplate) {
        this.presenceService = presenceService;
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
    }

    // ================= CONNECT =================
    @EventListener
    public void handleConnect(SessionConnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        String userIdStr = accessor.getFirstNativeHeader("userId");

        if (userIdStr != null) {

            UUID userId = UUID.fromString(userIdStr);

            // 🔥 LƯU VÀO SESSION (QUAN TRỌNG NHẤT)
            Map<String, Object> session = accessor.getSessionAttributes();
            if (session != null) {
                session.put("userId", userId);
            }

            // 1. Cập nhật trạng thái Online trong DB
            presenceService.setOnline(userId);

            // 2. Thông báo cho mọi người biết User này vừa Online
            messagingTemplate.convertAndSend(
                    "/topic/presence",
                    new PresenceDTO(userId, true, false)
            );

            // 3. 🔥 BỔ SUNG: Xử lý các tin nhắn chờ khi User vừa Online (SENT -> DELIVERED)
            // Việc này giúp người gửi thấy tin nhắn chuyển sang 2 tích xám ngay khi đối phương vừa kết nối
            try {
                messageService.processPendingMessages(userId);
            } catch (Exception e) {
                System.err.println("Error processing pending messages for user " + userId + ": " + e.getMessage());
            }
        }
    }

    // ================= DISCONNECT =================
    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {

        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());

        Map<String, Object> session = accessor.getSessionAttributes();

        if (session != null && session.containsKey("userId")) {

            UUID userId = (UUID) session.get("userId");

            // 1. Cập nhật trạng thái Offline trong DB
            presenceService.setOffline(userId);

            // 2. Thông báo cho mọi người biết User này vừa Offline
            messagingTemplate.convertAndSend(
                    "/topic/presence",
                    new PresenceDTO(userId, false, false)
            );
            
            System.out.println("User " + userId + " disconnected.");
        }
    }
    
}