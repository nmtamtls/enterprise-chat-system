// // package com.chatapp.backend.admin.service;

// import com.chatapp.backend.admin.dto.AdminDashboardResponse;
// import com.chatapp.backend.conversation.repository.ConversationRepository;
// import com.chatapp.backend.file.repository.FileRepository;
// import com.chatapp.backend.message.repository.MessageRepository;
// import com.chatapp.backend.user.repository.UserRepository;
// import com.chatapp.backend.conversation.repository.ConversationMemberRepository;
// import com.chatapp.backend.report.repository.ReportRepository; // Bổ sung

// import jakarta.transaction.Transactional;
// import org.springframework.stereotype.Service;
// import java.util.UUID;

// @Service
// public class AdminService {

//     private final UserRepository userRepository;
//     private final MessageRepository messageRepository;
//     private final FileRepository fileRepository;
//     private final ConversationRepository conversationRepository;
//     private final ConversationMemberRepository memberRepository;
//     private final ReportRepository reportRepository; // Bổ sung

//     public AdminService(UserRepository userRepository, 
//                         MessageRepository messageRepository, 
//                         FileRepository fileRepository,
//                         ConversationRepository conversationRepository,
//                         ConversationMemberRepository memberRepository,
//                         ReportRepository reportRepository) {
//         this.userRepository = userRepository;
//         this.messageRepository = messageRepository;
//         this.fileRepository = fileRepository;
//         this.conversationRepository = conversationRepository;
//         this.memberRepository = memberRepository;
//         this.reportRepository = reportRepository;
//     }

//     public AdminDashboardResponse getDashboard() {
//         // Thống kê dữ liệu hệ thống
//         long totalUsers = userRepository.count();
//         long totalMessages = messageRepository.count();
//         long totalFiles = fileRepository.count();
//         long totalConversations = conversationRepository.count();
        
//         // Thống kê báo cáo (Dùng cho Admin Dashboard)
//         long totalReports = reportRepository.count();
//         long pendingReports = reportRepository.countByStatus("pending");

//         return new AdminDashboardResponse(
//                 totalUsers, 
//                 totalMessages, 
//                 totalFiles, 
//                 totalConversations,
//                 totalReports,
//                 pendingReports
//         );
//     }

//     // ================= DELETE USER =================
//     @Transactional
//     public void deleteUser(UUID userId) {
//         if (!userRepository.existsById(userId)) {
//             throw new RuntimeException("User not found");
//         }
//         userRepository.deleteById(userId);
//     }

//     // ================= DELETE MESSAGE =================
//     @Transactional
//     public void deleteMessage(UUID messageId) {
//         if (!messageRepository.existsById(messageId)) {
//             throw new RuntimeException("Message not found");
//         }
//         messageRepository.deleteById(messageId);
//     }

//     // ================= DELETE FILE =================
//     @Transactional
//     public void deleteFile(UUID fileId) {
//         if (!fileRepository.existsById(fileId)) {
//             throw new RuntimeException("File not found");
//         }
//         fileRepository.deleteById(fileId);
//     }

//     // ================= DELETE CONVERSATION =================
//     @Transactional
//     public void deleteConversation(UUID conversationId) {
//         if (!conversationRepository.existsById(conversationId)) {
//             throw new RuntimeException("Conversation not found");
//         }
//         memberRepository.deleteByConversationId(conversationId);
//         messageRepository.deleteByConversationId(conversationId);
//         conversationRepository.deleteById(conversationId);
//     }
// }


package com.chatapp.backend.admin.service;

import com.chatapp.backend.admin.dto.AdminDashboardResponse;
import com.chatapp.backend.conversation.repository.ConversationRepository;
import com.chatapp.backend.file.repository.FileRepository;
import com.chatapp.backend.message.repository.MessageRepository;
import com.chatapp.backend.user.repository.UserRepository;
import com.chatapp.backend.conversation.repository.ConversationMemberRepository;
import com.chatapp.backend.report.repository.ReportRepository; // Bổ sung

import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final FileRepository fileRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final ReportRepository reportRepository; // Bổ sung

    public AdminService(UserRepository userRepository, 
                        MessageRepository messageRepository, 
                        FileRepository fileRepository,
                        ConversationRepository conversationRepository,
                        ConversationMemberRepository memberRepository,
                        ReportRepository reportRepository) {
        this.userRepository = userRepository;
        this.messageRepository = messageRepository;
        this.fileRepository = fileRepository;
        this.conversationRepository = conversationRepository;
        this.memberRepository = memberRepository;
        this.reportRepository = reportRepository;
    }

    public AdminDashboardResponse getDashboard() {
        // Thống kê dữ liệu hệ thống
        long totalUsers = userRepository.count();
        long totalMessages = messageRepository.count();
        long totalFiles = fileRepository.count();
        long totalConversations = conversationRepository.count();
        
        // Thống kê báo cáo (Dùng cho Admin Dashboard)
        long totalReports = reportRepository.count();
        long pendingReports = reportRepository.countByStatus("pending");

        return new AdminDashboardResponse(
                totalUsers, 
                totalMessages, 
                totalFiles, 
                totalConversations,
                totalReports,
                pendingReports
        );
    }

    // ================= DELETE USER =================
    @Transactional
    public void deleteUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    // ================= DELETE MESSAGE =================
    @Transactional
    public void deleteMessage(UUID messageId) {
        if (!messageRepository.existsById(messageId)) {
            throw new RuntimeException("Message not found");
        }
        messageRepository.deleteById(messageId);
    }

    // ================= DELETE FILE =================
    @Transactional
    public void deleteFile(UUID fileId) {
        if (!fileRepository.existsById(fileId)) {
            throw new RuntimeException("File not found");
        }
        fileRepository.deleteById(fileId);
    }

    // ================= DELETE CONVERSATION =================
    @Transactional
    public void deleteConversation(UUID conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new RuntimeException("Conversation not found");
        }
        memberRepository.deleteByConversationId(conversationId);
        messageRepository.deleteByConversationId(conversationId);
        conversationRepository.deleteById(conversationId);
    }
}