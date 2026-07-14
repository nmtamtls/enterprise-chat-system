package com.chatapp.backend.message.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
// import java.util.Optional;
import java.util.UUID;


import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.chatapp.backend.message.dto.MessageResponse;
import com.chatapp.backend.message.dto.SendMessageRequest;
import com.chatapp.backend.message.entity.Message;
import com.chatapp.backend.message.entity.MessageFile;
import com.chatapp.backend.message.entity.MessageStatus;
import com.chatapp.backend.message.repository.MessageFileRepository;
import com.chatapp.backend.message.repository.MessageRepository;
import com.chatapp.backend.message.repository.MessageStatusRepository;

import com.chatapp.backend.file.entity.File;
import com.chatapp.backend.file.repository.FileRepository;

// import com.chatapp.backend.settings.entity.Setting;
// import com.chatapp.backend.settings.repository.SettingRepository;

import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;
import com.chatapp.backend.contact.service.ContactService;
import com.chatapp.backend.conversation.entity.Conversation;
import com.chatapp.backend.conversation.entity.ConversationMember;
import com.chatapp.backend.conversation.repository.ConversationMemberRepository;
import com.chatapp.backend.conversation.repository.ConversationRepository;
import com.chatapp.backend.websocket.dto.ChatMessage;

import com.chatapp.backend.message.dto.ReactionRequest;
import com.chatapp.backend.message.dto.ReactionResponse;
import com.chatapp.backend.message.entity.MessageReaction;
import com.chatapp.backend.message.repository.MessageReactionRepository;

@Service
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final FileRepository fileRepository;
    private final MessageFileRepository messageFileRepository;
    private final MessageStatusRepository messageStatusRepository;

    private final MessageReactionRepository messageReactionRepository;
    private final ConversationMemberRepository conversationMemberRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final ConversationRepository conversationRepository; 
    private final com.chatapp.backend.contact.service.ContactService contactService;
    private final ObjectMapper objectMapper;
    
    // private final SettingRepository settingRepository;

    public MessageService(
            MessageRepository messageRepository,
            UserRepository userRepository,
            FileRepository fileRepository,
            MessageFileRepository messageFileRepository,
            MessageStatusRepository messageStatusRepository,
            
            MessageReactionRepository messageReactionRepository,
            ConversationMemberRepository conversationMemberRepository,
            SimpMessagingTemplate messagingTemplate,
            ConversationRepository conversationRepository, // <-- BỔ SUNG THAM SỐ NÀY
            ContactService contactService, // <-- BỔ SUNG THAM SỐ NÀY
            ObjectMapper objectMapper
            // SettingRepository settingRepository
    ) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.fileRepository = fileRepository;
        this.messageFileRepository = messageFileRepository;
        this.messageStatusRepository = messageStatusRepository;
        this.messageReactionRepository = messageReactionRepository;
        this.conversationMemberRepository = conversationMemberRepository;
        this.messagingTemplate = messagingTemplate;
        this.conversationRepository = conversationRepository; // <-- BỔ SUNG DÒNG NÀY
        this.contactService = contactService; // <-- BỔ SUNG DÒNG NÀY
        this.objectMapper = objectMapper; // <-- BỔ SUNG DÒNG NÀY
    }

@org.springframework.transaction.annotation.Transactional
    public MessageResponse send(SendMessageRequest req) {

        if (req.getConversationId() == null || req.getSenderId() == null) {
            throw new RuntimeException("conversationId or senderId is null");
        }


// ================= CHECK CHAT BLOCKED CHẶN CHÉO CHAT 1-1 =================
        
        // 1. Lấy thông tin phòng chat từ cơ sở dữ liệu
        Conversation conversation = conversationRepository.findById(req.getConversationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        // 2. Chỉ áp dụng kiểm tra chặn nếu loại phòng chat là "PRIVATE" (Chat 1-1)
        if ("PRIVATE".equalsIgnoreCase(conversation.getType())) {
            
            // Tìm ID của thành viên còn lại tham gia trong cuộc trò chuyện này
            UUID receiverId = conversationMemberRepository.findByConversationId(req.getConversationId())
                    .stream()
                    .map(ConversationMember::getUserId)
                    .filter(userId -> !userId.equals(req.getSenderId()))
                    .findFirst()
                    .orElse(null);

            // 🔥 TỐI ƯU & BẢO VỆ: Chỉ kiểm tra chặn chéo nếu tìm thấy receiverId và receiverId khác biệt với senderId
            if (receiverId != null) {
                if (contactService.isBlockedBetween(req.getSenderId(), receiverId)) {
                    throw new RuntimeException("Không thể gửi tin nhắn. Bạn hoặc đối phương đã chặn nhau.");
                }
            }
        }
        // ================= CHECK CHAT BLOCKED (ADMIN KHÓA CHAT) =================

        // Optional<Setting> chatBlocked =
        //         settingRepository.findByUserIdAndKey(
        //                 req.getSenderId(),
        //                 "CHAT_BLOCKED"
        //         );

        // if (chatBlocked.isPresent()
        //         && "true".equalsIgnoreCase(chatBlocked.get().getValue())) {

        //     throw new RuntimeException("Bạn đã bị khóa chat");
        // }

        // ================= DETECT TYPE =================

        String type = req.getMessageType();

        if (type == null || type.isBlank()) {

            type = (req.getFileUrl() != null)
                    ? detectFileType(req.getFileType(), req.getFileName())
                    : "TEXT";
        }



        if (req.getFileUrl() != null) {

    try {

        ObjectMapper mapper = new ObjectMapper();

        java.util.Map<String, Object> meta =
                new java.util.HashMap<>();

        meta.put("text", "");

        meta.put("iv", req.getIv());

        meta.put("encrypted", req.getEncrypted() != null ? req.getEncrypted(): false );

        meta.put("mimeType", req.getFileType());
        meta.put("aesKey", req.getAesKey());

        req.setContent( mapper.writeValueAsString(meta));

    } catch (Exception e) {

        req.setContent(null);
    }
}

        // ================= SAVE MESSAGE =================

        Message m = new Message();

        m.setId(UUID.randomUUID());
        m.setConversationId(req.getConversationId());
        m.setSenderId(req.getSenderId());
        m.setContent(req.getContent());
        m.setMessageType(type);
        m.setCreatedAt(LocalDateTime.now());
        m.setUpdatedAt(LocalDateTime.now());
        m.setIsDeleted(false);

        Message saved = messageRepository.save(m);

      

        // ================= CREATE STATUS =================

conversationMemberRepository.findByConversationId(saved.getConversationId())
.stream()
.filter(member -> !member.getUserId().equals(saved.getSenderId()))
.forEach(member -> {

    MessageStatus status = new MessageStatus();

    status.setId(UUID.randomUUID());
    status.setMessageId(saved.getId());
    status.setUserId(member.getUserId());

    if ("GROUP".equalsIgnoreCase(conversation.getType())) {
        status.setStatus("delivered");
    } else {
        status.setStatus("sent");
    }

    status.setUpdatedAt(LocalDateTime.now());

    messageStatusRepository.save(status);

    // =====================================================
    // REALTIME STATUS UPDATE
    // =====================================================

    messagingTemplate.convertAndSendToUser(
            saved.getSenderId().toString(),
            "/queue/status-update",
            new StatusUpdateResponse(
                    saved.getId(),
                    status.getStatus()
            )
    );

    // =====================================================
    // REALTIME UNREAD COUNT
    // =====================================================

    long unreadCount =
            messageStatusRepository
                    .countUnreadByConversation(
                            member.getUserId(),
                            saved.getConversationId()
                    );

    Map<String, Object> payload = new HashMap<>();

    payload.put("type", "UNREAD_COUNT");
    payload.put("conversationId", saved.getConversationId());
    payload.put("count", unreadCount);

    System.out.println("===== SEND UNREAD =====");
    System.out.println("Receiver UserId: " + member.getUserId());
    System.out.println("ConversationId: " + saved.getConversationId());
    System.out.println("Unread Count: " + unreadCount);
    System.out.println("Payload: " + payload);

    // ✅ PHẢI DÙNG convertAndSendToUser
    messagingTemplate.convertAndSendToUser(
            member.getUserId().toString(),
            "/queue/unread",
            payload
    );
});

 

        // ================= SAVE FILE =================

        if (req.getFileUrl() != null) {

            File file = new File();

            file.setId(UUID.randomUUID());
            file.setUploaderId(req.getSenderId());

            file.setFileName(
                    req.getFileName() != null
                            ? req.getFileName()
                            : extractFileName(req.getFileUrl())
            );

            file.setFileUrl(req.getFileUrl());
            file.setFileType(type);

            file.setFileSize(
                    req.getFileSize() != null
                            ? req.getFileSize()
                            : 0L
            );

            File savedFile = fileRepository.save(file);

            MessageFile mf = new MessageFile();

            mf.setId(UUID.randomUUID());
            mf.setMessageId(saved.getId());
            mf.setFileId(savedFile.getId());

            messageFileRepository.save(mf);
        }

        return toResponse(saved);
    }
    // =====================================================
    // PROCESS PENDING MESSAGES
    // =====================================================

    @Transactional
    public void processPendingMessages(UUID userId) {

        List<MessageStatus> pendingStatuses =
                messageStatusRepository.findAllByUserIdAndStatus(
                        userId,
                        "sent"
                );

        for (MessageStatus status : pendingStatuses) {

            status.setStatus("delivered");
            status.setUpdatedAt(LocalDateTime.now());

            messageStatusRepository.save(status);

            messageRepository.findById(status.getMessageId())
                    .ifPresent(originalMsg -> {

                        messagingTemplate.convertAndSendToUser(
                                originalMsg.getSenderId().toString(),
                                "/queue/status-update",
                                new StatusUpdateResponse(
                                        originalMsg.getId(),
                                        "delivered"
                                )
                        );
                    });
        }
    }

    // =====================================================
    // MARK AS READ
    // =====================================================

    @Transactional
    public void markAsRead(UUID conversationId, UUID readerId) {

        List<Message> messages =
                messageRepository
                        .findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(
                                conversationId
                        );

        for (Message msg : messages) {

            if (!msg.getSenderId().equals(readerId)) {

                messageStatusRepository
                        .findByMessageIdAndUserId(msg.getId(), readerId)
                        .ifPresent(status -> {

                            if (!"read".equalsIgnoreCase(status.getStatus())) {

                                status.setStatus("read");
                                status.setUpdatedAt(LocalDateTime.now());

                                messageStatusRepository.save(status);

                                // long unreadCount = getUnreadCount(readerId);

                                // messagingTemplate.convertAndSendToUser(
                                //         readerId.toString(),
                                //         "/queue/unread",
                                //         unreadCount
                                //         );

                                long unreadCount = getUnreadCount(readerId);

Map<String, Object> payload = new HashMap<>();

payload.put("type", "UNREAD_COUNT");
payload.put("count", unreadCount);

// nếu có conversationId thì thêm luôn
payload.put("conversationId", conversationId);

System.out.println("📩 UNREAD: " + payload);

messagingTemplate.convertAndSendToUser(
        readerId.toString(),
        "/queue/unread",
        payload
);

                                messagingTemplate.convertAndSendToUser(
                                        msg.getSenderId().toString(),
                                        "/queue/status-update",
                                        new StatusUpdateResponse(
                                                msg.getId(),
                                                "read"
                                        )
                                );

                                System.out.println(
                                        "READ: " + msg.getId()
                                );
                            }
                        });
            }
        }
    }

    // =====================================================
    // MARK AS DELIVERED
    // =====================================================

    // public long getUnreadCount(UUID readerId) {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'getUnreadCount'");
    // }
    public long getUnreadCount(UUID userId) {

    return messageStatusRepository.countByUserIdAndStatusIn(
            userId,
            List.of("sent", "delivered")
    );
}

    @Transactional
    public void markAsDelivered(UUID messageId, UUID userId) {

        messageStatusRepository
                .findByMessageIdAndUserId(messageId, userId)
                .ifPresent(status -> {

                    if ("sent".equalsIgnoreCase(status.getStatus())) {

                        status.setStatus("delivered");
                        status.setUpdatedAt(LocalDateTime.now());

                        messageStatusRepository.save(status);

                        messageRepository.findById(messageId)
                                .ifPresent(originalMsg -> {

                                    messagingTemplate.convertAndSendToUser(
                                            originalMsg.getSenderId().toString(),
                                            "/queue/status-update",
                                            new StatusUpdateResponse(
                                                    messageId,
                                                    "delivered"
                                            )
                                    );

                                    System.out.println(
                                            "DELIVERED: " + messageId
                                    );
                                });
                    }
                });
    }
    // =====================================================
    // USER RECALL MESSAGE (THU HỒI TIN NHẮN REAL-TIME)
    // =====================================================
    @Transactional
    public void recallMessage(UUID messageId, UUID requesterId) {
        // 1. Tìm tin nhắn trong DB
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        // 2. Bảo mật: Đảm bảo thằng bấm thu hồi chính là chủ nhân tin nhắn (Sender)
        if (!message.getSenderId().equals(requesterId)) {
            throw new RuntimeException("Bạn không có quyền thu hồi tin nhắn này!");
        }

        // 3. Cập nhật trạng thái thu hồi (isDeleted = true) chứ không xóa bản ghi
        message.setIsDeleted(true);
        message.setUpdatedAt(LocalDateTime.now());
        messageRepository.save(message);

        UUID conversationId = message.getConversationId();

        // 4. Cấu trúc gói tin Socket báo thu hồi
        java.util.Map<String, Object> recallPayload = new java.util.HashMap<>();
        recallPayload.put("type", "MESSAGE_RECALLED"); 
        recallPayload.put("id", messageId.toString()); // 🔥 Đổi key thành "id" để khớp hoàn toàn với Client bóc tách (data.id)
        recallPayload.put("messageId", messageId.toString());
        recallPayload.put("conversationId", conversationId.toString());
        recallPayload.put("isDeleted", true);

        // 5. 🔥 SỬA TẠI ĐÂY: Bắn thẳng vào Topic phòng chat thay vì loop gửi cá nhân
        String destination = "/topic/conversations/" + conversationId.toString();
        messagingTemplate.convertAndSend(destination, recallPayload);

        System.out.println(">>> [Socket Broadcast] USER RECALLED TIN NHẮN: " + messageId + " gửi tới " + destination);
    }
    // =====================================================
    // USER EDIT MESSAGE (CHỈNH SỬA TIN NHẮN REAL-TIME)
    // =====================================================

public MessageResponse editMessage(UUID messageId, UUID senderId, String newContent) {
    Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Tin nhắn không tồn tại"));

    // Kiểm tra quyền sở hữu tin nhắn nếu cần...

    String currentDbContent = message.getContent();
    String originalContent;
    
    // Nếu tin nhắn đã từng sửa (chứa ký tự |||), giữ nguyên vế đầu làm nội dung gốc
    if (currentDbContent != null && currentDbContent.contains("|||")) {
        originalContent = currentDbContent.split("\\|\\|\\|")[0];
    } else {
        originalContent = currentDbContent; // Sửa lần đầu
    }

    // Gộp dữ liệu vào cột content duy nhất
    message.setContent(originalContent + "|||" + newContent.trim());
    message.setUpdatedAt(LocalDateTime.now());

    Message updatedMessage = messageRepository.save(message);

    // 🔥 FIX LỖI TẠI ĐÂY: Khởi tạo trực tiếp MessageResponse DTO theo cấu trúc constructor của bạn
    MessageResponse response = new MessageResponse();
    response.setId(updatedMessage.getId());
    response.setConversationId(updatedMessage.getConversationId());
    response.setSenderId(updatedMessage.getSenderId());
    
    // Trả về nội dung mới nhất cho client nhắn tin (chính là phần chữ mới sau khi edit)
    response.setContent(newContent.trim()); 
    response.setMessageType(updatedMessage.getMessageType());
    response.setCreatedAt(updatedMessage.getCreatedAt());
    response.setUpdatedAt(updatedMessage.getUpdatedAt());

    return response;
}
    // =====================================================
    // USER REPLY MESSAGE (TRẢ LỜI TIN NHẮN REAL-TIME)
    // =====================================================

    private String formatReplyContent(UUID replyToId, String content) {
        return "[REPLY:" + replyToId + "]" + content.trim();
    }

    private boolean isReplyMessage(String content) {
        return content != null && content.startsWith("[REPLY:");
    }

    private MessageResponse.RepliedMessageInfo getRepliedMessageInfo(String content) {
    if (!isReplyMessage(content)) return null;

    int endBracketIndex = content.indexOf("]");
    if (endBracketIndex == -1) return null;

    try {
        UUID replyId = UUID.fromString(content.substring(7, endBracketIndex));
        Message originalMsg = messageRepository.findById(replyId).orElse(null);

        // 1. Xử lý trường hợp tin nhắn đã bị thu hồi hoặc không tồn tại
        if (originalMsg == null || Boolean.TRUE.equals(originalMsg.getIsDeleted())) {
            return new MessageResponse.RepliedMessageInfo(
                replyId, 
                "Thông báo", 
                "Tin nhắn đã được thu hồi"
            );
        }

        User originalSender = userRepository.findById(originalMsg.getSenderId()).orElse(null);
        
        // 2. Tách nội dung sạch
        String rawContent = originalMsg.getContent();
        String cleanContent = rawContent;

        // Xử lý nếu tin nhắn gốc là một tin nhắn Reply (lọc [REPLY:id])
        if (isReplyMessage(cleanContent)) {
            int idx = cleanContent.indexOf("]");
            if (idx != -1) cleanContent = cleanContent.substring(idx + 1).trim();
        }

        // 🔥 FIX LỖI: Xử lý nếu tin nhắn gốc đã từng được Edit (lọc |||)
        if (cleanContent.contains("|||")) {
            // Lấy vế sau của ||| vì đó là nội dung mới nhất
            String[] parts = cleanContent.split("\\|\\|\\|");
            cleanContent = parts[parts.length - 1].trim();
        }

        return new MessageResponse.RepliedMessageInfo(
            originalMsg.getId(),
            originalSender != null ? originalSender.getFullName() : "Unknown",
            cleanContent
        );
    } catch (Exception e) {
        return null;
    }
}

    public MessageResponse replyMessage(UUID conversationId, UUID senderId, UUID replyToId, String content) {
        // 1. Kiểm tra tin nhắn gốc tồn tại và bảo mật
        Message originalMessage = messageRepository.findById(replyToId)
                .orElseThrow(() -> new RuntimeException("Tin nhắn gốc không tồn tại"));

        if (!originalMessage.getConversationId().equals(conversationId)) {
            throw new RuntimeException("Tin nhắn gốc không nằm trong cuộc trò chuyện này");
        }

        // 2. Tạo tin nhắn mới
        Message message = new Message();
        message.setId(UUID.randomUUID()); // Sửa lỗi đánh máy: đã thêm 'm'
        message.setConversationId(conversationId);
        message.setSenderId(senderId);
        message.setMessageType("TEXT");
        
        // BỔ SUNG: Thiết lập thời gian để tránh lỗi constraint NOT NULL ở database
        message.setCreatedAt(LocalDateTime.now());
        message.setUpdatedAt(LocalDateTime.now());
        message.setIsDeleted(false);
        
        // 3. Sử dụng helper method
        message.setContent(formatReplyContent(replyToId, content));
        
        Message savedMessage = messageRepository.save(message);

        // 4. Trả về Response
        return toResponse(savedMessage);
    }
    
    // =====================================================
// GHIM TIN NHẮN (REALTIME)
// =====================================================
@Transactional
public MessageResponse pinMessage(UUID messageId) {

    Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

    // ✅ update entity
    message.setIsPinned(true);
    message.setPinnedAt(LocalDateTime.now());

    // ✅ save entity mới
    Message savedMessage = messageRepository.save(message);

    // ✅ convert response
    MessageResponse response = toResponse(savedMessage);

    // ✅ realtime websocket
    messagingTemplate.convertAndSend(
            "/topic/conversations/" + savedMessage.getConversationId(),
            response
    );

    return response;
}

// =====================================================
// BỎ GHIM TIN NHẮN (REALTIME)
// =====================================================
@Transactional
public MessageResponse unpinMessage(UUID messageId) {

    Message message = messageRepository.findById(messageId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

    // ✅ update entity
    message.setIsPinned(false);
    message.setPinnedAt(null);

    // ✅ save entity mới
    Message savedMessage = messageRepository.save(message);

    // ✅ convert response
    MessageResponse response = toResponse(savedMessage);

    // ✅ realtime websocket
    messagingTemplate.convertAndSend(
            "/topic/conversations/" + savedMessage.getConversationId(),
            response
    );

    return response;
}

// =====================================================
// LẤY DANH SÁCH TIN NHẮN ĐÃ GHIM
// =====================================================
public List<MessageResponse> getPinnedMessages(UUID conversationId) {

    return messageRepository
            .findByConversationIdAndIsPinnedTrueOrderByPinnedAtDesc(conversationId)
            .stream()
            .map(this::toResponse)
            .toList();
}
    
    // =====================================================
    // SAVE FROM SOCKET
    // =====================================================
    @Transactional
public MessageResponse saveFromSocket(ChatMessage msg) {

    if (msg.getConversationId() == null
            || msg.getSenderId() == null) {

        throw new RuntimeException("Invalid socket message");
    }

    // DEBUG
    System.out.println("===== SOCKET MESSAGE =====");
    System.out.println("FILE URL: " + msg.getFileUrl());
    System.out.println("FILE NAME: " + msg.getFileName());
    System.out.println("FILE TYPE: " + msg.getFileType());
    System.out.println("IV: " + msg.getIv());
    System.out.println("ENCRYPTED: " + msg.getEncrypted());

    SendMessageRequest req = new SendMessageRequest();

    // ===== BASIC =====
    req.setConversationId(msg.getConversationId());
    req.setSenderId(msg.getSenderId());
    req.setContent(msg.getContent());

    // ===== FILE =====
    req.setFileUrl(msg.getFileUrl());
    req.setFileName(msg.getFileName());
    req.setFileSize(msg.getFileSize());
    req.setFileType(msg.getFileType());

    // ===== ENCRYPT =====
    req.setIv(msg.getIv());
    req.setEncrypted( msg.getEncrypted() != null ? msg.getEncrypted() : false);
    req.setAesKey(msg.getAesKey()); // 🔥 BẮT BUỘC

    // ===== TYPE =====
    req.setMessageType(
            msg.getMessageType() != null
                    ? msg.getMessageType()
                    : "TEXT"
    );

    // DEBUG
    System.out.println("===== REQUEST =====");
    System.out.println("REQ FILE URL: " + req.getFileUrl());
    System.out.println("REQ IV: " + req.getIv());
    System.out.println("REQ ENCRYPTED: " + req.getEncrypted());

    return send(req);
}

    // =====================================================
    // UNREAD COUNT
    // =====================================================

public long getUnreadCountByConversation(
        UUID conversationId,
        UUID userId
) {

    return messageStatusRepository
            .countUnreadByConversationAndUser(
                    conversationId,
                    userId
            );
}

    // =====================================================
    // GET ALL
    // =====================================================

    public List<MessageResponse> getAll() {

        return messageRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // =====================================================
    // GET BY CONVERSATION
    // =====================================================

    public List<MessageResponse> getByConversation(
            UUID conversationId,
            UUID readerId
    ) {

        if (conversationId == null) {
            throw new RuntimeException("conversationId is null");
        }

        if (readerId != null) {
            this.markAsRead(conversationId, readerId);
        }

        return messageRepository
                .findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(
                        conversationId
                )
                .stream()
                .map(this::toResponse)
                .toList();
    }

    
//     // =====================================================
//     // TO RESPONSE
//     // =====================================================


private MessageResponse toResponse(Message m) {

    User user = userRepository
            .findById(m.getSenderId())
            .orElse(null);



    List<String> statuses =
        messageStatusRepository
                .findAllByMessageId(m.getId())
                .stream()
                .map(MessageStatus::getStatus)
                .map(String::toLowerCase)
                .toList();

String currentStatus = "sent";

if (statuses.contains("read")) {

    currentStatus = "read";

} else if (statuses.contains("delivered")) {

    currentStatus = "delivered";
}

    File file =
            messageFileRepository
                    .findAllByMessageId(m.getId())
                    .stream()
                    .findFirst()
                    .flatMap(mf ->
                            fileRepository.findById(mf.getFileId())
                    )
                    .orElse(null);

    // ===== REPLY =====
    MessageResponse.RepliedMessageInfo repliedMessage =
            getRepliedMessageInfo(m.getContent());

    // ===== DEFAULT =====
    String content = "";
    String iv = null;
    Boolean encrypted = false;
    String fileType = null;

    try {

        // =========================================
        // FILE ENCRYPT JSON
        // =========================================
        if (
                m.getContent() != null
                        && m.getContent().trim().startsWith("{")
        ) {

            ObjectMapper mapper = new ObjectMapper();

            JsonNode node =
                    mapper.readTree(m.getContent());

            // ===== TEXT =====
            content =
                    node.has("text")
                            ? node.get("text").asText()
                            : "";

            // ===== IV =====
            iv =
                    node.has("iv")
                            && !node.get("iv").isNull()
                            ? node.get("iv").asText()
                            : null;

            // ===== ENCRYPTED =====
            encrypted =
                    node.has("encrypted")
                            && node.get("encrypted").asBoolean();

            // ===== MIME TYPE =====
            fileType =
                    node.has("mimeType")
                            && !node.get("mimeType").isNull()
                            ? node.get("mimeType").asText()
                            : null;

        } else {

            content = m.getContent();
        }

    } catch (Exception e) {

        e.printStackTrace();

        content = m.getContent();
    }

    // =========================================
    // REPLY CONTENT CLEAN
    // =========================================
    if (
            repliedMessage != null
                    && content != null
                    && content.contains("]")
    ) {

        content =
                content.substring(
                        content.indexOf("]") + 1
                ).trim();
    }

    // =========================================
    // FALLBACK FILE TYPE
    // =========================================
    if (fileType == null && file != null) {

        fileType = file.getFileType();
    }

    // DEBUG
    System.out.println("===== TO RESPONSE =====");
    System.out.println("MESSAGE ID: " + m.getId());
    System.out.println("FILE URL: " + (file != null ? file.getFileUrl() : null));
    System.out.println("FILE TYPE: " + fileType);
    System.out.println("IV: " + iv);
    System.out.println("ENCRYPTED: " + encrypted);

    String aesKey = null;



try {
    JsonNode node = objectMapper.readTree(m.getContent());

    aesKey = node.has("aesKey")
            ? node.get("aesKey").asText()
            : null;

} catch (Exception e) {
    e.printStackTrace();
}

// List<Map<String, Integer>> detectedMentions = extractMentions(m.getContent(), m.getConversationId());

// Sửa dòng này trong phương thức toResponse của MessageService.java

// Sửa thành:
List<Map<String, Object>> detectedMentions = extractMentions(m.getContent(), m.getConversationId(), m.getSenderId());
    // =========================================
    // RESPONSE
    // =========================================
return new MessageResponse(
            m.getId(),
            m.getConversationId(),
            m.getSenderId(),
            user != null ? user.getFullName() : "Unknown User",
            user != null ? user.getAvatarUrl() : null,
            content,
            m.getMessageType(),
            m.getCreatedAt(),
            m.getUpdatedAt(),
            file != null ? file.getFileUrl() : null,
            file != null ? file.getFileName() : null,
            file != null ? file.getFileSize() : 0L,

            // ĐÚNG THỨ TỰ TỪ CLASS: (fileType, iv, encrypted, status, repliedMessage)
            fileType,                    
            iv,                  
            aesKey,        
            encrypted,                   
            currentStatus.toLowerCase(), 

            m.getIsPinned() != null ? m.getIsPinned() : false,
            m.getPinnedAt(),
            repliedMessage,
            detectedMentions
        );
}

// =====================================================
    // FILE TYPE
    // =====================================================

    private String detectFileType(
            String contentType,
            String fileName
    ) {

        if (contentType != null) {

            if (contentType.startsWith("image/")) {
                return "IMAGE";
            }

            if (contentType.startsWith("video/")) {
                return "VIDEO";
            }
        }

        if (fileName != null) {

            String lower = fileName.toLowerCase();

            if (lower.matches(".*\\.(png|jpg|jpeg|gif|webp)$")) {
                return "IMAGE";
            }

            if (lower.matches(".*\\.(mp4|mov|avi|mkv)$")) {
                return "VIDEO";
            }
        }

        return "FILE";
    }

    // =====================================================
    // EXTRACT FILE NAME
    // =====================================================

    private String extractFileName(String url) {

        return (url == null)
                ? "file"
                : url.substring(url.lastIndexOf("/") + 1);
    }

    @Transactional
public ReactionResponse reactMessage(ReactionRequest request) {

    Message message = messageRepository.findById(request.getMessageId())
            .orElseThrow(() -> new RuntimeException("Message not found"));

    var existing = messageReactionRepository.findByMessageIdAndUserId(
            request.getMessageId(),
            request.getUserId()
    );

    String action;

    if (existing.isPresent()) {

        MessageReaction reaction = existing.get();

        if (reaction.getEmoji().equals(request.getEmoji())) {
            messageReactionRepository.delete(reaction);
            action = "REMOVED";
        } else {
            reaction.setEmoji(request.getEmoji());
            messageReactionRepository.save(reaction);
            action = "UPDATED";
        }

    } else {
        MessageReaction reaction = new MessageReaction();
        reaction.setMessageId(request.getMessageId());
        reaction.setUserId(request.getUserId());
        reaction.setEmoji(request.getEmoji());

        messageReactionRepository.save(reaction);
        action = "ADDED";
    }

    ReactionResponse response = new ReactionResponse(
            request.getMessageId(),
            request.getUserId(),
            request.getEmoji(),
            action
    );

    messagingTemplate.convertAndSend(
            "/topic/conversations/" + message.getConversationId(),
            response
    );

    return response;
}

public List<ReactionResponse> getReactions(UUID messageId) {

    return messageReactionRepository.findByMessageId(messageId)
            .stream()
            .map(r -> new ReactionResponse(
                    r.getMessageId(),
                    r.getUserId(),
                    r.getEmoji(),
                    "EXISTING"
            ))
            .toList();
}


// private List<Map<String, Integer>> extractMentions(String content, UUID conversationId) {
//     List<Map<String, Integer>> mentions = new ArrayList<>();
//     if (content == null) return mentions;

//     // Lấy danh sách thành viên trong cuộc trò chuyện hiện tại
//     var members = conversationMemberRepository.findByConversationId(conversationId);

//     for (var member : members) {
//         User user = userRepository.findById(member.getUserId()).orElse(null);
//         if (user == null) continue;

//         String name = "@" + user.getFullName();
//         int index = content.indexOf(name);
        
//         // Tìm tất cả vị trí của tên này trong nội dung
//         while (index != -1) {
//             Map<String, Integer> mention = new HashMap<>();
//             mention.put("start", index);
//             mention.put("end", index + name.length());
//             mentions.add(mention);
//             index = content.indexOf(name, index + 1);
//         }
//     }
//     return mentions;
// }


// private List<Map<String, Object>> extractMentions(String content, UUID conversationId) {
//     List<Map<String, Object>> mentions = new ArrayList<>();
//     if (content == null || content.isEmpty()) return mentions;

//     // 1. Lấy danh sách thành viên từ repository (đảm bảo đúng tên biến và kiểu dữ liệu)
//     // Giả sử repository là conversationMemberRepository
//     List<ConversationMember> members = conversationMemberRepository.findByConversationId(conversationId);

//     if (members != null) {
//         for (ConversationMember member : members) {
//             // 2. Lấy thông tin User từ userId của member
//             User user = userRepository.findById(member.getUserId()).orElse(null);
//             if (user == null || user.getFullName() == null) continue;

//             String name = "@" + user.getFullName();
//             int index = content.indexOf(name);
            
//             // 3. Tìm tất cả các lần xuất hiện của tên trong chuỗi nội dung
//             while (index != -1) {
//                 Map<String, Object> mention = new HashMap<>();
//                 mention.put("userId", user.getId().toString()); // Chuyển UUID sang String để tránh lỗi JSON
//                 mention.put("start", index);
//                 mention.put("end", index + name.length());
//                 mentions.add(mention);
                
//                 // Tìm tiếp vị trí kế tiếp
//                 index = content.indexOf(name, index + 1);
//             }
//         }
//     }
//     return mentions;
// }

private List<Map<String, Object>> extractMentions(String content, UUID conversationId, UUID senderId) {
    List<Map<String, Object>> mentions = new ArrayList<>();
    if (content == null || content.isEmpty()) return mentions;

    List<ConversationMember> members = conversationMemberRepository.findByConversationId(conversationId);

    if (members != null) {
        for (ConversationMember member : members) {
            // 🔥 ĐIỀU KIỆN MỚI: Bỏ qua nếu là chính người gửi
            if (member.getUserId().equals(senderId)) continue;

            User user = userRepository.findById(member.getUserId()).orElse(null);
            if (user == null || user.getFullName() == null) continue;

            String name = "@" + user.getFullName();
            int index = content.indexOf(name);
            
            while (index != -1) {
                Map<String, Object> mention = new HashMap<>();
                mention.put("userId", user.getId().toString());
                mention.put("start", index);
                mention.put("end", index + name.length());
                mentions.add(mention);
                index = content.indexOf(name, index + 1);
            }
        }
    }
    return mentions;
}
    // =====================================================
    // SOCKET STATUS RESPONSE
    // =====================================================

    public static record StatusUpdateResponse(
            UUID messageId,
            String status
    ) {}
}