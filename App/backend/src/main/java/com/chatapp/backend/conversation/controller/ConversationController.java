




package com.chatapp.backend.conversation.controller;

import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.conversation.dto.*;
import com.chatapp.backend.conversation.service.ConversationService;
import com.chatapp.backend.file.dto.FileResponse;
import com.chatapp.backend.file.service.FileService;
import com.chatapp.backend.user.dto.UserResponse;
import com.chatapp.backend.user.repository.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
public class ConversationController {

    private final ConversationService service;
    private final UserRepository userRepository;
    private final FileService fileService;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public ConversationController(
            ConversationService service,
            UserRepository userRepository,
            FileService fileService
    ) {
        this.service = service;
        this.userRepository = userRepository;
        this.fileService = fileService;
    }

    // =====================================================
    // CREATE CONVERSATION
    // =====================================================

    @PostMapping
    public ResponseEntity<ApiResponse<ConversationResponse>> create(
            @RequestBody CreateConversationRequest req
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Created",
                        service.create(req)
                )
        );
    }

    // =====================================================
    // GET USER CONVERSATIONS
    // =====================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getByUser(
            @PathVariable UUID userId
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Success",
                        service.getByUser(userId)
                )
        );
    }

    // =====================================================
    // LEAVE GROUP
    // =====================================================

    @DeleteMapping("/{conversationId}/leave")
    public ResponseEntity<ApiResponse<String>> leaveGroup(
            @PathVariable UUID conversationId,
            Principal principal
    ) {

        UUID userId = userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        service.leaveGroup(conversationId, userId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Đã rời nhóm thành công",
                        null
                )
        );
    }

    // =====================================================
    // ADMIN
    // =====================================================

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<ConversationResponse>>> getAll() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Success",
                        service.findAll()
                )
        );
    }

    @GetMapping("/admin/groups")
    public ResponseEntity<ApiResponse<List<AdminGroupDTO>>> getGroupsForAdmin() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Success",
                        service.getAdminGroups()
                )
        );
    }

    // =====================================================
    // DELETE GROUP
    // =====================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteConversation(
            @PathVariable UUID id
    ) {

        service.deleteConversation(id);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Giải tán nhóm thành công",
                        null
                )
        );
    }

    // =====================================================
    // UPDATE GROUP AVATAR
    // =====================================================

    @PostMapping("/{conversationId}/avatar")
    public ResponseEntity<ApiResponse<ConversationResponse>>
    updateGroupAvatar(
            @PathVariable UUID conversationId,
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {

        UUID userId = userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() ->
                        new RuntimeException("User not found"))
                .getId();

        // upload ảnh
        FileResponse uploaded =
                fileService.uploadFile(file);

        // update DB
        ConversationResponse response =
                service.updateGroupAvatar(
                        conversationId,
                        userId,
                        uploaded.getFileUrl()
                );

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Cập nhật ảnh nhóm thành công",
                        response
                )
        );
    }

    // =====================================================
    // UPDATE GROUP NAME
    // =====================================================
@PutMapping("/{conversationId}/name")
public ResponseEntity<ApiResponse<ConversationResponse>>
updateGroupName(
        @PathVariable UUID conversationId,
        @RequestBody CreateConversationRequest request,
        Principal principal
) {

    UUID userId = userRepository
            .findByUsername(principal.getName())
            .orElseThrow(() ->
                    new RuntimeException("User not found"))
            .getId();

    ConversationResponse response =
            service.updateGroupName(
                    conversationId,
                    userId,
                    request.getName()
            );

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "Đổi tên nhóm thành công",
                    response
            )
    );
}

    // =====================================================
    // REMOVE MEMBER FROM GROUP (Admin/Nhóm trưởng chỉ định)
    // =====================================================

    @DeleteMapping("/{conversationId}/members/{memberId}")
    public ResponseEntity<ApiResponse<String>> removeMember(
            @PathVariable UUID conversationId,
            @PathVariable UUID memberId,
            Principal principal
    ) {
        // Lấy ID người đang thực hiện hành động (nhóm trưởng)
        UUID adminId = userRepository
                .findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getId();

        // Gọi service để thực hiện xóa
        // Trong service cần kiểm tra: 
        // 1. conversationId có tồn tại và là nhóm không?
        // 2. adminId có đúng là người tạo nhóm (createdBy) không?
        // 3. memberId có tồn tại trong nhóm không?
        service.removeMemberFromGroup(conversationId, adminId, memberId);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Đã xóa thành viên khỏi nhóm thành công",
                        null
                )
        );
    }

    // =====================================================
    // SEARCH MEMBERS IN CONVERSATION (FOR MENTIONING) (Tag thành viên trong nhóm)
    // =====================================================

    @GetMapping("/{conversationId}/members/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchMembers(
            @PathVariable UUID conversationId,
            @RequestParam("query") String query
    ) {
        // Giả định bạn có phương thức searchMembers trong ConversationService
        // Hoặc bạn có thể gọi trực tiếp repository để lấy danh sách phù hợp
        List<UserResponse> members = service.searchMembersInConversation(conversationId, query);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Success",
                        members
                )
        );
    }


}