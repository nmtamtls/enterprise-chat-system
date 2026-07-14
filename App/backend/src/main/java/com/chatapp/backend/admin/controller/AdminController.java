package com.chatapp.backend.admin.controller;

import com.chatapp.backend.admin.dto.AdminDashboardResponse;
import com.chatapp.backend.admin.service.AdminService;
import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.report.dto.ReportResponse;
import com.chatapp.backend.report.service.ReportService;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardResponse> getDashboard() {
        AdminDashboardResponse stats = adminService.getDashboard();
        return new ApiResponse<>(
                true,
                "Lấy dữ liệu thống kê thành công",
                stats
        );
    }

// ================= CHỨC NĂNG XÓA DÀNH CHO ADMIN =================

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable UUID userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User đã bị xóa vĩnh viễn", null));
    }

    @DeleteMapping("/messages/{messageId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteMessage(@PathVariable UUID messageId) {
        adminService.deleteMessage(messageId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Tin nhắn đã bị xóa", null));
    }

    @DeleteMapping("/conversations/{conversationId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteConversation(@PathVariable UUID conversationId) {
        adminService.deleteConversation(conversationId);
        return ResponseEntity.ok(new ApiResponse<>(true, "Nhóm đã được giải tán", null));
    }

    @DeleteMapping("/files/{fileId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteFile(@PathVariable UUID fileId) {
        adminService.deleteFile(fileId);
        return ResponseEntity.ok(new ApiResponse<>(true, "File đã được xóa", null));
    }

    // Bổ sung vào AdminController.java

@Autowired
private ReportService reportService;

// Lấy danh sách tất cả báo cáo
@GetMapping("/reports")
@PreAuthorize("hasRole('ADMIN')")
public ApiResponse<List<ReportResponse>> getAllReports() {
    return new ApiResponse<>(true, "Lấy danh sách báo cáo thành công", reportService.getAllReports());
}

// Cập nhật trạng thái báo cáo (Ví dụ: 'RESOLVED', 'REJECTED')
@PutMapping("/reports/{reportId}/status")
@PreAuthorize("hasRole('ADMIN')")
public ApiResponse<ReportResponse> updateReportStatus(
        @PathVariable UUID reportId, 
        @RequestBody String status) { // Bạn có thể tạo DTO cho status nếu muốn chặt chẽ hơn
    return new ApiResponse<>(true, "Cập nhật trạng thái thành công", reportService.updateReportStatus(reportId, status));
}
}

