// // Tạo tại: src/main/java/com/chatapp/backend/websocket/controller/WebSocketEventListener.java
// package com.chatapp.backend.websocket.controller;

// import com.chatapp.backend.presence.entity.Presence;
// import com.chatapp.backend.presence.service.PresenceService;
// import org.springframework.context.event.EventListener;
// import org.springframework.messaging.simp.SimpMessagingTemplate;
// import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
// import org.springframework.stereotype.Component;
// import org.springframework.web.socket.messaging.SessionDisconnectEvent;
// import java.util.UUID;

// @Component
// public class WebSocketEventListener {
//     private final PresenceService presenceService;
//     private final SimpMessagingTemplate messagingTemplate;

//     public WebSocketEventListener(PresenceService presenceService, SimpMessagingTemplate messagingTemplate) {
//         this.presenceService = presenceService;
//         this.messagingTemplate = messagingTemplate;
//     }

//     @EventListener
//     public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
//         StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
//         UUID userId = (UUID) headerAccessor.getSessionAttributes().get("userId");

//         if (userId != null) {
//             Presence p = presenceService.setOffline(userId);
//             messagingTemplate.convertAndSend("/topic/presence", p);
//             System.out.println("User " + userId + " disconnected.");
//         }
//     }
// }





package com.chatapp.backend.websocket.controller;

import com.chatapp.backend.presence.entity.Presence;
import com.chatapp.backend.presence.service.PresenceService;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import java.util.Map;
import java.util.UUID;

@Component
public class WebSocketEventListener {
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketEventListener(PresenceService presenceService, SimpMessagingTemplate messagingTemplate) {
        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        
        // 1. Kiểm tra an toàn để tránh NullPointerException tại getSessionAttributes()
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();
        
        if (sessionAttributes != null) {
            Object userIdObj = sessionAttributes.get("userId");
            
            if (userIdObj != null) {
                UUID userId;
                
                // 2. Ép kiểu an toàn (đề phòng trường hợp userId đang là String)
                if (userIdObj instanceof String) {
                    userId = UUID.fromString((String) userIdObj);
                } else {
                    userId = (UUID) userIdObj;
                }

                // 3. Xử lý logic offline
                Presence p = presenceService.setOffline(userId);
                messagingTemplate.convertAndSend("/topic/presence", p);
                
                System.out.println("User " + userId + " disconnected.");
            }
        }
    }
}