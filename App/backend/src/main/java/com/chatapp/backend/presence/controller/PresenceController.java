// src/main/java/com/chatapp/backend/presence/controller/PresenceController.java
package com.chatapp.backend.presence.controller;

import com.chatapp.backend.presence.service.PresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/presence")
@CrossOrigin("*") // Đảm bảo React có thể gọi tới
public class PresenceController {

    private final PresenceService presenceService;

    public PresenceController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @GetMapping("/online-users")
    public ResponseEntity<Map<UUID, Boolean>> getOnlineUsers() {
        // Gọi hàm chúng ta vừa bổ sung ở Service
        return ResponseEntity.ok(presenceService.getAllOnlineStatus());
    }
}