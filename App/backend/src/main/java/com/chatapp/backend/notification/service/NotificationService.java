


package com.chatapp.backend.notification.service;

import com.chatapp.backend.notification.entity.Notification;
import com.chatapp.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    
    // Đối tượng này dùng để đẩy dữ liệu qua WebSocket
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Tạo thông báo mới và gửi Real-time xuống Frontend
     */
    @Transactional
    public Notification create(Notification notification) {
        // 1. Lưu vào Database để người dùng xem lại sau này
        Notification savedNotification = notificationRepository.save(notification);

        // 2. Gửi thông báo đến đúng người nhận qua WebSocket
        // Frontend sẽ subscribe tại: /user/{userId}/queue/notifications
        messagingTemplate.convertAndSendToUser(
                notification.getUserId().toString(),
                "/queue/notifications",
                savedNotification
        );

        return savedNotification;
    }

    /**
     * Lấy danh sách tất cả thông báo của một người dùng
     */
    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Đánh dấu thông báo là đã xem
     */
    @Transactional
    public void markAsRead(UUID id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        n.setRead(true);
        notificationRepository.save(n);
    }

    /**
     * Đếm số lượng thông báo chưa đọc (để hiển thị badge số đỏ trên UI)
     */
    public long countUnread(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Xóa thông báo khi lời mời kết bạn bị từ chối hoặc hủy
     */
    @Transactional
    public void deleteNotification(UUID id) {
        notificationRepository.deleteById(id);
    }
}