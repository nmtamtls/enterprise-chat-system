// package com.chatapp.backend.report.service;

// import java.util.List;
// import java.util.UUID;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.chatapp.backend.report.dto.CreateReportRequest;
// import com.chatapp.backend.report.dto.ReportResponse;
// import com.chatapp.backend.report.entity.Report;
// import com.chatapp.backend.report.repository.ReportRepository;
// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;
// import com.chatapp.backend.message.repository.MessageRepository;
// import com.chatapp.backend.message.entity.Message;
// import com.chatapp.backend.websocket.service.AdminNotificationService;

// @Service
// public class ReportService {

//     @Autowired
//     private ReportRepository reportRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private MessageRepository messageRepository;

//     @Autowired
//     private AdminNotificationService adminNotificationService;

//     // ================= USER: tạo report =================
//     @Transactional
//     public ReportResponse createReport(String identifier, CreateReportRequest request) {
//         // Tìm kiếm linh hoạt: Thử tìm theo Email, nếu không thấy thì tìm theo Username
//         // Cách này giải quyết vấn đề do JwtFilter lấy Username thay vì Email từ token
//         User reporter = userRepository.findByEmail(identifier)
//                 .orElseGet(() -> userRepository.findByUsername(identifier)
//                 .orElseThrow(() -> new RuntimeException("User not found with identifier: " + identifier)));
        
//         Report report = new Report();
//         report.setReporterId(reporter.getId());
//         report.setReason(request.getReason());
//         report.setDescription(request.getDescription());
//         report.setStatus("pending");

//         // Logic xử lý linh hoạt: Báo cáo Message HOẶC User
//         if (request.getMessageId() != null) {
//             Message message = messageRepository.findById(request.getMessageId())
//                     .orElseThrow(() -> new RuntimeException("Message not found"));
//             report.setMessageId(message.getId());
//             report.setReportType("MESSAGE");
//         } else if (request.getTargetId() != null) {
//             // Kiểm tra sự tồn tại của User bị báo cáo
//             userRepository.findById(request.getTargetId())
//                     .orElseThrow(() -> new RuntimeException("Target user not found"));
//             report.setTargetId(request.getTargetId());
//             System.out.println("Reporter ID = " + reporter.getId());
//             System.out.println("Request Target ID = " + request.getTargetId());
//             report.setReportType("USER");
//         } else {
//             throw new RuntimeException("Phải cung cấp ID đối tượng cần báo cáo");
//         }

//         Report saved = reportRepository.save(report);

//         System.out.println("Saved Reporter = " + saved.getReporterId());
//         System.out.println("Saved Target   = " + saved.getTargetId());
//         ReportResponse response = map(saved);

//         adminNotificationService.broadcastNewReport(response);
//         return response;
//     }

//     // ================= ADMIN: các hàm hỗ trợ =================
//     public List<ReportResponse> getAllReports() {
//         return reportRepository.findAll().stream().map(this::map).toList();
//     }

//     public List<ReportResponse> getReportsByStatus(String status) {
//         return reportRepository.findByStatus(status).stream().map(this::map).toList();
//     }

//     @Transactional
//     public ReportResponse updateReportStatus(UUID reportId, String status) {
//         Report report = reportRepository.findById(reportId)
//                 .orElseThrow(() -> new RuntimeException("Report not found"));
//         report.setStatus(status);
//         return map(reportRepository.save(report));
//     }

//     // ================= ADMIN: xóa report =================
// @Transactional
// public void deleteReport(UUID reportId) {
//     if (!reportRepository.existsById(reportId)) {
//         throw new RuntimeException("Report not found with ID: " + reportId);
//     }
//     reportRepository.deleteById(reportId);
// }

//   // ================= Mapping (Dữ liệu an toàn) =================
//     private ReportResponse map(Report r) {
//         ReportResponse res = new ReportResponse();
//         res.setId(r.getId());
//         res.setReason(r.getReason());
//         res.setDescription(r.getDescription());
//         res.setStatus(r.getStatus());
//         res.setReportType(r.getReportType());
//         res.setCreatedAt(r.getCreatedAt());
        
//         // 1. Luôn map thông tin Reporter
//         userRepository.findById(r.getReporterId()).ifPresent(user -> {
//             res.setReporterId(user.getId());
//             res.setReporterName(user.getUsername());
//         });
        
//         // 2. Map thông tin đối tượng dựa trên ReportType
//         if ("MESSAGE".equals(r.getReportType()) && r.getMessageId() != null) {
//             messageRepository.findById(r.getMessageId()).ifPresent(msg -> {
//                 res.setMessageId(msg.getId());
//                 res.setMessageContent(msg.getContent());
//             });
//         } 
//         else if ("USER".equals(r.getReportType()) && r.getTargetId() != null) {
//             userRepository.findById(r.getTargetId()).ifPresent(user -> {
//                 res.setTargetId(user.getId());
//                 res.setTargetName(user.getUsername()); // Đảm bảo lấy đúng user này
//             });
//         }
        
//         return res;
//     }
// }

// package com.chatapp.backend.report.service;

// import java.util.List;
// import java.util.UUID;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import com.chatapp.backend.report.dto.CreateReportRequest;
// import com.chatapp.backend.report.dto.ReportResponse;
// import com.chatapp.backend.report.entity.Report;
// import com.chatapp.backend.report.repository.ReportRepository;
// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;
// import com.chatapp.backend.message.repository.MessageRepository;
// import com.chatapp.backend.message.entity.Message;
// import com.chatapp.backend.conversation.repository.ConversationRepository;
// import com.chatapp.backend.websocket.service.AdminNotificationService;

// @Service
// public class ReportService {

//     @Autowired
//     private ReportRepository reportRepository;

//     @Autowired
//     private UserRepository userRepository;

//     @Autowired
//     private MessageRepository messageRepository;
    
//     @Autowired
//     private ConversationRepository conversationRepository;

//     @Autowired
//     private AdminNotificationService adminNotificationService;

//     // ================= USER: tạo report =================
//     @Transactional
//     public ReportResponse createReport(String identifier, CreateReportRequest request) {
//         User reporter = userRepository.findByEmail(identifier)
//                 .orElseGet(() -> userRepository.findByUsername(identifier)
//                 .orElseThrow(() -> new RuntimeException("User not found with identifier: " + identifier)));
        
//         Report report = new Report();
//         report.setReporterId(reporter.getId());
//         report.setReason(request.getReason());
//         report.setDescription(request.getDescription());
//         report.setStatus("pending");

//         if (request.getMessageId() != null) {
//             Message message = messageRepository.findById(request.getMessageId())
//                     .orElseThrow(() -> new RuntimeException("Message not found"));
//             report.setMessageId(message.getId());
//             report.setReportType("MESSAGE");
//         } else if (request.getTargetId() != null) {
//             if (userRepository.existsById(request.getTargetId())) {
//                 report.setTargetId(request.getTargetId());
//                 report.setReportType("USER");
//             } else if (conversationRepository.existsById(request.getTargetId())) {
//                 report.setTargetId(request.getTargetId());
//                 // Thay đổi từ CONVERSATION sang GROUP
//                 report.setReportType("GROUP"); 
//             } else {
//                 throw new RuntimeException("Đối tượng cần báo cáo không tồn tại trong hệ thống");
//             }
//         } else {
//             throw new RuntimeException("Phải cung cấp ID đối tượng cần báo cáo");
//         }

//         Report saved = reportRepository.save(report);
//         ReportResponse response = map(saved);

//         adminNotificationService.broadcastNewReport(response);
//         return response;
//     }

//     // ================= ADMIN: các hàm hỗ trợ =================
//     public List<ReportResponse> getAllReports() {
//         return reportRepository.findAll().stream().map(this::map).toList();
//     }

//     public List<ReportResponse> getReportsByStatus(String status) {
//         return reportRepository.findByStatus(status).stream().map(this::map).toList();
//     }

//     @Transactional
//     public ReportResponse updateReportStatus(UUID reportId, String status) {
//         Report report = reportRepository.findById(reportId)
//                 .orElseThrow(() -> new RuntimeException("Report not found"));
//         report.setStatus(status);
//         return map(reportRepository.save(report));
//     }

//     @Transactional
//     public void deleteReport(UUID reportId) {
//         if (!reportRepository.existsById(reportId)) {
//             throw new RuntimeException("Report not found with ID: " + reportId);
//         }
//         reportRepository.deleteById(reportId);
//     }

//     // ================= Mapping =================
//     private ReportResponse map(Report r) {
//         ReportResponse res = new ReportResponse();
//         res.setId(r.getId());
//         res.setReason(r.getReason());
//         res.setDescription(r.getDescription());
//         res.setStatus(r.getStatus());
//         res.setReportType(r.getReportType());
//         res.setCreatedAt(r.getCreatedAt());
        
//         userRepository.findById(r.getReporterId()).ifPresent(user -> {
//             res.setReporterId(user.getId());
//             res.setReporterName(user.getUsername());
//         });
        
//         if ("MESSAGE".equals(r.getReportType()) && r.getMessageId() != null) {
//             messageRepository.findById(r.getMessageId()).ifPresent(msg -> {
//                 res.setMessageId(msg.getId());
//                 res.setMessageContent(msg.getContent());
//             });
//         } 
//         else if ("USER".equals(r.getReportType()) && r.getTargetId() != null) {
//             userRepository.findById(r.getTargetId()).ifPresent(user -> {
//                 res.setTargetId(user.getId());
//                 res.setTargetName(user.getUsername());
//             });
//         }
//         // Hỗ trợ cả dữ liệu cũ (CONVERSATION) và mới (GROUP)
//         else if (("GROUP".equals(r.getReportType()) || "CONVERSATION".equals(r.getReportType())) 
//                  && r.getTargetId() != null) {
//             conversationRepository.findById(r.getTargetId()).ifPresent(conv -> {
//                 res.setTargetId(conv.getId());
//                 res.setTargetName(conv.getName());
//             });
//         }
        
//         return res;
//     }
// }
package com.chatapp.backend.report.service;

import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.chatapp.backend.report.dto.CreateReportRequest;
import com.chatapp.backend.report.dto.ReportResponse;
import com.chatapp.backend.report.entity.Report;
import com.chatapp.backend.report.repository.ReportRepository;
import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;
import com.chatapp.backend.message.repository.MessageRepository;
import com.chatapp.backend.conversation.repository.ConversationRepository;
import com.chatapp.backend.websocket.service.AdminNotificationService;

@Service
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private AdminNotificationService adminNotificationService;

@Transactional
public ReportResponse createReport(String identifier, CreateReportRequest request) {
    // 1. KIỂM TRA DỮ LIỆU ĐẦU VÀO (Chặn báo cáo không có nội dung)
    if (request.getReason() == null || request.getReason().trim().isEmpty()) {
        throw new RuntimeException("Lý do báo cáo không được để trống!");
    }
    if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
        throw new RuntimeException("Mô tả báo cáo không được để trống!");
    }

    // 2. Tìm người báo cáo
    User reporter = userRepository.findByEmail(identifier)
            .orElseGet(() -> userRepository.findByUsername(identifier)
            .orElseThrow(() -> new RuntimeException("User not found")));

    // 3. Xác định loại đối tượng và kiểm tra tồn tại
    String reportType = null;
    boolean isExistingReport = false;

    if (request.getMessageId() != null) {
        reportType = "MESSAGE";
        isExistingReport = reportRepository.existsByReporterIdAndTargetIdAndReportType(
            reporter.getId(), request.getMessageId(), reportType);
    } else if (request.getTargetId() != null) {
        if (userRepository.existsById(request.getTargetId())) {
            reportType = "USER";
        } else if (conversationRepository.existsById(request.getTargetId())) {
            reportType = "GROUP";
        } else {
            throw new RuntimeException("Đối tượng cần báo cáo không tồn tại");
        }
        isExistingReport = reportRepository.existsByReporterIdAndTargetIdAndReportType(
            reporter.getId(), request.getTargetId(), reportType);
    } else {
        throw new RuntimeException("Phải cung cấp ID đối tượng hoặc tin nhắn cần báo cáo");
    }

    // 4. Lưu báo cáo (Chỉ thực hiện khi các kiểm tra trên đã vượt qua)
    Report report = new Report();
    report.setReporterId(reporter.getId());
    report.setTargetId(request.getTargetId());
    report.setMessageId(request.getMessageId());
    report.setReportType(reportType);
    report.setReason(request.getReason());
    report.setDescription(request.getDescription());
    report.setStatus("pending");

    Report saved = reportRepository.save(report);
    
    ReportResponse response = map(saved);
    response.setAlreadyReported(isExistingReport);

    adminNotificationService.broadcastNewReport(response);
    return response;
}
    // ================= ADMIN: các hàm hỗ trợ =================
    public List<ReportResponse> getAllReports() {
        return reportRepository.findAll().stream().map(this::map).toList();
    }

    public List<ReportResponse> getReportsByStatus(String status) {
        return reportRepository.findByStatus(status).stream().map(this::map).toList();
    }

    @Transactional
    public ReportResponse updateReportStatus(UUID reportId, String status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        report.setStatus(status.toLowerCase());
        return map(reportRepository.save(report));
    }

    @Transactional
    public void deleteReport(UUID reportId) {
        if (!reportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found with ID: " + reportId);
        }
        reportRepository.deleteById(reportId);
    }

    // ================= Mapping =================
    private ReportResponse map(Report r) {
        ReportResponse res = new ReportResponse();
        res.setId(r.getId());
        res.setReason(r.getReason());
        res.setDescription(r.getDescription());
        res.setStatus(r.getStatus());
        res.setReportType(r.getReportType());
        res.setCreatedAt(r.getCreatedAt());
        
        userRepository.findById(r.getReporterId()).ifPresent(user -> {
            res.setReporterId(user.getId());
            res.setReporterName(user.getUsername());
        });
        
        if ("MESSAGE".equals(r.getReportType()) && r.getMessageId() != null) {
            messageRepository.findById(r.getMessageId()).ifPresent(msg -> {
                res.setMessageId(msg.getId());
                res.setMessageContent(msg.getContent());
            });
        } 
        else if ("USER".equals(r.getReportType()) && r.getTargetId() != null) {
            userRepository.findById(r.getTargetId()).ifPresent(user -> {
                res.setTargetId(user.getId());
                res.setTargetName(user.getUsername());
            });
        }
        else if (("GROUP".equals(r.getReportType()) || "CONVERSATION".equals(r.getReportType())) 
                 && r.getTargetId() != null) {
            conversationRepository.findById(r.getTargetId()).ifPresent(conv -> {
                res.setTargetId(conv.getId());
                res.setTargetName(conv.getName());
            });
        }
        
        return res;
    }
}