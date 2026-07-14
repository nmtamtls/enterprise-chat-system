package com.chatapp.backend.websocket.service;

import com.chatapp.backend.report.dto.ReportResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Service này chuyên trách việc đẩy thông báo Real-time cho Admin.
 * Được tách biệt để dễ dàng thay đổi logic thông báo trong tương lai.
 */
@Service
@RequiredArgsConstructor
public class AdminNotificationService {

    // SimpMessagingTemplate là công cụ chính để gửi tin qua WebSocket (STOMP)
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Broadcast dữ liệu báo cáo mới đến tất cả Admin đang kết nối.
     * * @param report Dữ liệu báo cáo vừa được tạo (đã bao gồm thông tin chi tiết qua map)
     */
    public void broadcastNewReport(ReportResponse report) {
        // Địa chỉ (topic) mà Frontend của Admin cần subscribe để lắng nghe
        String destination = "/topic/admin/reports";
        
        messagingTemplate.convertAndSend(destination, report);
    }
}