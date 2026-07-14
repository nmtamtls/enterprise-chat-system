package com.chatapp.backend.report.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.report.dto.CreateReportRequest;
import com.chatapp.backend.report.service.ReportService;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin
public class ReportController {

    @Autowired
    private ReportService reportService;

    // ================= USER: tạo report =================
    @PostMapping
    public ResponseEntity<ApiResponse<?>> createReport(
            @RequestBody CreateReportRequest request,
            Authentication authentication) {

        // Logic cải tiến: Kiểm tra xem có 1 trong 2 trường targetId hoặc messageId không
        // Giả sử CreateReportRequest của bạn có getter getTargetId() và getMessageId()
        if (request.getMessageId() == null && request.getTargetId() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Either Message ID or Target ID is required"));
        }
        
        if (request.getReason() == null || request.getReason().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reason is required"));
        }

        String email = authentication.getName();

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Report created successfully",
                        reportService.createReport(email, request)
                )
        );
    }

    // ================= ADMIN: xem tất cả report =================
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getAllReports() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Get all reports successfully",
                        reportService.getAllReports()
                )
        );
    }

    // ================= ADMIN: lọc theo trạng thái =================
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> getByStatus(@PathVariable String status) {
        if (status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Status is required"));
        }
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Get reports by status successfully",
                        reportService.getReportsByStatus(status)
                )
        );
    }

    // ================= ADMIN: xử lý report =================
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> updateStatus(
            @PathVariable UUID id,
            @RequestParam String status) {

        if (id == null || status == null || status.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid ID or Status"));
        }

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Update report status successfully",
                        reportService.updateReportStatus(id, status)
                )
        );
    }

    // ================= ADMIN: xóa report =================
@DeleteMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<ApiResponse<?>> deleteReport(@PathVariable UUID id) {
    if (id == null) {
        return ResponseEntity.badRequest().body(ApiResponse.error("Report ID is required"));
    }
    
    reportService.deleteReport(id); // Giả sử service của bạn có hàm này
    return ResponseEntity.ok(
            ApiResponse.success("Delete report successfully", null)
    );
}
}