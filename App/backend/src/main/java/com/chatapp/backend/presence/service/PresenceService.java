package com.chatapp.backend.presence.service;

import com.chatapp.backend.presence.entity.Presence;
import com.chatapp.backend.presence.repository.PresenceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PresenceService {

    // 🔥 cache RAM (realtime)
    private final Map<UUID, Presence> presenceMap = new ConcurrentHashMap<>();

    private final PresenceRepository presenceRepository;

    public PresenceService(PresenceRepository presenceRepository) {
        this.presenceRepository = presenceRepository;
    }

    // ================= SET ONLINE =================
    public Presence setOnline(UUID userId) {

        Presence p = presenceRepository.findById(userId)
                .orElse(new Presence());

        p.setUserId(userId);
        p.setIsOnline(true);
        p.setIsTyping(false);
        p.setLastSeen(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        // 🔥 save DB
        Presence saved = presenceRepository.save(p);

        // 🔥 cache RAM
        presenceMap.put(userId, saved);

        return saved;
    }

    // ================= SET OFFLINE =================
    public Presence setOffline(UUID userId) {

        Presence p = presenceRepository.findById(userId)
                .orElse(new Presence());

        p.setUserId(userId);
        p.setIsOnline(false);
        p.setIsTyping(false);
        p.setLastSeen(LocalDateTime.now());
        p.setUpdatedAt(LocalDateTime.now());

        Presence saved = presenceRepository.save(p);

        presenceMap.put(userId, saved);

        return saved;
    }

    // ================= SET TYPING =================
    public Presence setTyping(UUID userId, boolean typing) {

        Presence p = presenceRepository.findById(userId)
                .orElse(new Presence());

        p.setUserId(userId);
        p.setIsTyping(typing);
        p.setUpdatedAt(LocalDateTime.now());

        Presence saved = presenceRepository.save(p);

        presenceMap.put(userId, saved);

        return saved;
    }

    // ================= GET STATUS =================
    public Presence getStatus(UUID userId) {

        // 🔥 ưu tiên RAM
        if (presenceMap.containsKey(userId)) {
            return presenceMap.get(userId);
        }

        // 🔥 fallback DB
        Presence p = presenceRepository.findById(userId)
                .orElse(
                        Presence.builder()
                                .userId(userId)
                                .isOnline(false)
                                .isTyping(false)
                                .build()
                );

        presenceMap.put(userId, p);

        return p;
    }

    // ================= CHECK ONLINE =================
    public boolean isOnline(UUID userId) {
        return getStatus(userId).getIsOnline() != null
                && getStatus(userId).getIsOnline();
    }
    // ================= GET ALL ONLINE STATUS =================
public java.util.Map<UUID, Boolean> getAllOnlineStatus() {
    java.util.Map<UUID, Boolean> statusMap = new java.util.HashMap<>();
    
    // Cách 1: Lấy từ Cache RAM (Nhanh nhất cho realtime)
    presenceMap.forEach((uuid, presence) -> {
        statusMap.put(uuid, presence.getIsOnline());
    });
    
    return statusMap;
}
}