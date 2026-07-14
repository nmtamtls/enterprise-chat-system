package com.chatapp.backend.message.controller;

import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.message.dto.*;
import com.chatapp.backend.message.service.MessageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    // ================= SEND =================
    @PostMapping
    public ResponseEntity<ApiResponse<MessageResponse>> send(
            @RequestBody SendMessageRequest req
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Sent", messageService.send(req))
        );
    }

    // ================= GET ALL (🔥 THÊM MỚI) =================
    @GetMapping
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getAll() {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "OK", messageService.getAll())
        );
    }

    // ================= GET BY CONVERSATION =================
    @GetMapping("/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> get(
            @PathVariable UUID conversationId
    ) {
        return ResponseEntity.ok(
                new ApiResponse<>(true, "OK",
                        messageService.getByConversation(conversationId, conversationId))
        );
    }
    // ================= MARK AS READ (🔥 BỔ SUNG MỚI) =================
@PatchMapping("/{conversationId}/read")
public ResponseEntity<ApiResponse<String>> markAsRead(
        @PathVariable UUID conversationId,
        @RequestParam UUID userId
) {
    messageService.markAsRead(conversationId, userId);
    return ResponseEntity.ok(
            new ApiResponse<>(true, "Messages marked as read", null)
    );
}

// =====================================================
// UNREAD COUNT
// =====================================================

@GetMapping("/unread-count/{userId}")
public ResponseEntity<ApiResponse<Long>> getUnreadCount(
        @PathVariable UUID userId
) {

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "OK",
                    messageService.getUnreadCount(userId)
            )
    );
}
// ================= USER RECALL (THU HỒI TIN NHẮN) =================
    @PatchMapping("/{messageId}/recall")
    public ResponseEntity<ApiResponse<String>> recallMessage(
            @PathVariable UUID messageId,
            @RequestParam UUID senderId
    ) {
        // senderId truyền từ Frontend lên để Backend check xem có đúng là chủ nhân tin nhắn không
        messageService.recallMessage(messageId, senderId);
        
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Tin nhắn đã được thu hồi thành công", null)
        );
    }
    // ================= USER EDIT (CHỈNH SỬA TIN NHẮN) =================
    @PutMapping("/{messageId}/edit")
    public ResponseEntity<ApiResponse<MessageResponse>> editMessage(
            @PathVariable UUID messageId,
            @RequestParam UUID senderId,
            @RequestBody SendMessageRequest req
    ) {
        // Kiểm tra nội dung rỗng rải rác trước khi đẩy xuống Service
        if (req.getContent() == null || req.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung tin nhắn không được để trống");
        }

        MessageResponse updatedMessage = messageService.editMessage(messageId, senderId, req.getContent());

        return ResponseEntity.ok(
                new ApiResponse<>(true, "Tin nhắn đã được chỉnh sửa thành công", updatedMessage)
        );
    }

    // ================= USER REPLY (TRẢ LỜI TIN NHẮN) =================
    @PostMapping("/{conversationId}/reply")
    public ResponseEntity<ApiResponse<MessageResponse>> replyMessage(
            @PathVariable UUID conversationId,
            @RequestParam UUID senderId,
            @RequestBody SendMessageRequest req
    ) {
        // 1. Kiểm tra đầu vào
        if (req.getContent() == null || req.getContent().trim().isEmpty()) {
            throw new RuntimeException("Nội dung tin nhắn không được để trống");
        }
        
        if (req.getReplyToId() == null) {
            throw new RuntimeException("Phải chỉ định ID tin nhắn cần trả lời");
        }

        // 2. Gọi service xử lý logic reply
        // Truyền cả conversationId, senderId, replyToId và nội dung
        MessageResponse repliedMessage = messageService.replyMessage(
                conversationId, 
                senderId, 
                req.getReplyToId(), 
                req.getContent()
        );

        // 3. Trả về phản hồi thành công
        return ResponseEntity.ok(
                new ApiResponse<>(true, "Tin nhắn đã được gửi trả lời thành công", repliedMessage)
        );
    }
// ================= GHIM TIN NHẮN =================
@PutMapping("/{messageId}/pin")
public ResponseEntity<ApiResponse<MessageResponse>> pinMessage(
        @PathVariable UUID messageId
) {

    MessageResponse response = messageService.pinMessage(messageId);

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "Tin nhắn đã được ghim thành công",
                    response
            )
    );
}

// ================= BỎ GHIM TIN NHẮN =================
@PutMapping("/{messageId}/unpin")
public ResponseEntity<ApiResponse<MessageResponse>> unpinMessage(
        @PathVariable UUID messageId
) {

    MessageResponse response = messageService.unpinMessage(messageId);

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "Đã bỏ ghim tin nhắn",
                    response
            )
    );
}

// ================= LẤY DANH SÁCH TIN NHẮN ĐÃ GHIM =================
@GetMapping("/conversation/{conversationId}/pinned")
public ResponseEntity<ApiResponse<List<MessageResponse>>> getPinnedMessages(
        @PathVariable UUID conversationId
) {

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "OK",
                    messageService.getPinnedMessages(conversationId)
            )
    );
}

// ================= REACT MESSAGE =================
@PostMapping("/react")
public ResponseEntity<ApiResponse<ReactionResponse>> reactMessage(
        @RequestBody ReactionRequest request
) {

    ReactionResponse response = messageService.reactMessage(request);

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "Reaction updated successfully",
                    response
            )
    );
}
// ================= GET REACTIONS BY MESSAGE =================
@GetMapping("/{messageId}/reactions")
public ResponseEntity<ApiResponse<List<ReactionResponse>>> getReactions(
        @PathVariable UUID messageId
) {

    List<ReactionResponse> reactions = messageService.getReactions(messageId);

    return ResponseEntity.ok(
            new ApiResponse<>(
                    true,
                    "OK",
                    reactions
            )
    );
}
}