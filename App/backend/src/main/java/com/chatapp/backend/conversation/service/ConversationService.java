package com.chatapp.backend.conversation.service;

import com.chatapp.backend.conversation.dto.AdminGroupDTO;
import com.chatapp.backend.conversation.dto.ConversationResponse;
import com.chatapp.backend.conversation.dto.CreateConversationRequest;
import com.chatapp.backend.conversation.entity.Conversation;
import com.chatapp.backend.conversation.entity.ConversationMember;
import com.chatapp.backend.conversation.repository.ConversationMemberRepository;
import com.chatapp.backend.conversation.repository.ConversationRepository;
import com.chatapp.backend.user.repository.UserRepository;
import com.chatapp.backend.message.repository.MessageStatusRepository;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMemberRepository memberRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final UserRepository userRepository;
    private final MessageStatusRepository messageStatusRepository;

    public ConversationService(
            ConversationRepository conversationRepository,
            ConversationMemberRepository memberRepository,
            SimpMessagingTemplate messagingTemplate,
            UserRepository userRepository,
            MessageStatusRepository messageStatusRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.memberRepository = memberRepository;
        this.messagingTemplate = messagingTemplate;
        this.userRepository = userRepository;
        this.messageStatusRepository = messageStatusRepository;
    }

    // =====================================================
    // CREATE CONVERSATION
    // =====================================================

    @Transactional
    public ConversationResponse create(
            CreateConversationRequest req
    ) {

        // =================================================
        // PRIVATE CHAT
        // =================================================

        if ("PRIVATE".equals(req.getType())) {

            if (req.getMemberIds() == null
                    || req.getMemberIds().size() != 2) {

                throw new RuntimeException(
                        "Chat cá nhân cần chính xác 2 người."
                );
            }

            return getOrCreatePrivateConversation(
                    req.getMemberIds().get(0),
                    req.getMemberIds().get(1)
            );
        }

        // =================================================
        // GROUP CHAT
        // =================================================

        Conversation c = new Conversation();

        c.setType("GROUP");
        c.setName(req.getName());
        c.setCreatedBy(req.getCreatedBy());
        c.setCreatedAt(LocalDateTime.now());
        c.setUpdatedAt(LocalDateTime.now());

        Conversation saved =
        conversationRepository.save(c);

if (req.getMemberIds() != null) {

    for (UUID memberId : req.getMemberIds()) {

        saveMember(
                saved.getId(),
                memberId,
                memberId.equals(req.getCreatedBy())
                        ? "owner"
                        : "member"
        );
    }
}

// 🔥 tạo response SAU KHI save members
ConversationResponse response =
        toResponse(saved, req.getCreatedBy());

// websocket notify
if (req.getMemberIds() != null) {

    for (UUID memberId : req.getMemberIds()) {

        messagingTemplate.convertAndSendToUser(
                memberId.toString(),
                "/queue/notifications",
                response
        );
    }
}

return response;
    }

    // =====================================================
    // PRIVATE CHAT
    // =====================================================

    @Transactional
    public ConversationResponse getOrCreatePrivateConversation(
            UUID userA,
            UUID userB
    ) {

        return memberRepository
                .findPrivateConversation(userA, userB)

                .flatMap(conversationRepository::findById)

                // .map(this::toResponse)
                .map(c -> toResponse(c, userB))

                .orElseGet(() -> {

                    Conversation c = new Conversation();

                    c.setType("PRIVATE");
                    c.setCreatedBy(userA);
                    c.setCreatedAt(LocalDateTime.now());
                    c.setUpdatedAt(LocalDateTime.now());

                    Conversation saved =
                            conversationRepository.save(c);

                    saveMember(saved.getId(), userA, "member");
                    saveMember(saved.getId(), userB, "member");

                    ConversationResponse response =
                            toResponse(saved, userB);

                    messagingTemplate.convertAndSendToUser(
                            userA.toString(),
                            "/queue/notifications",
                            response
                    );

                    messagingTemplate.convertAndSendToUser(
                            userB.toString(),
                            "/queue/notifications",
                            response
                    );

                    return response;
                });
    }

    // =====================================================
    // GET USER CONVERSATIONS
    // =====================================================

    @Transactional(readOnly = true)
    public List<ConversationResponse> getByUser(
            UUID userId
    ) {

        return conversationRepository
                   .findAllJoinedConversations(userId)
                   .stream()
                   .map(c -> toResponse(c, userId))
                   .collect(Collectors.toList());
    }

    // =====================================================
    // FIND ALL
    // =====================================================

    @Transactional(readOnly = true)
    public List<ConversationResponse> findAll() {

        return conversationRepository.findAll()
                .stream()
                // .map(this::toResponse)
                // .map(c -> toResponse(c, userId))
                .map(c -> toResponse(c, null))
                .collect(Collectors.toList());
    }

    // =====================================================
    // ADMIN GROUPS
    // =====================================================

    @Transactional(readOnly = true)
    public List<AdminGroupDTO> getAdminGroups() {

        return conversationRepository.findAll()
                .stream()

                .filter(c ->
                        "GROUP".equals(c.getType())
                )

                .map(c -> {

                    List<String> names =
                            memberRepository
                                    .findUserNamesByConversationId(
                                            c.getId()
                                    );

                    String creatorName =
                            userRepository
                                    .findById(c.getCreatedBy())

                                    .map(user ->
                                            user.getFullName()
                                    )

                                    .orElse("Hệ thống");

                    return new AdminGroupDTO(
                            toResponse(c, null),
                            names.size(),
                            names,
                            creatorName
                    );
                })

                .collect(Collectors.toList());
    }

    

// =====================================================
// UPDATE GROUP AVATAR
// =====================================================

@Transactional
public ConversationResponse updateGroupAvatar(
        UUID conversationId,
        UUID userId,
        String avatarUrl
) {

    Conversation conversation = conversationRepository
            .findById(conversationId)
            .orElseThrow(() ->
                    new RuntimeException("Conversation not found"));

    // chỉ owner được sửa
    if (!conversation.getCreatedBy().equals(userId)) {
        throw new RuntimeException("Bạn không có quyền đổi ảnh nhóm");
    }

    conversation.setGroupAvatar(avatarUrl);
    conversation.setUpdatedAt(LocalDateTime.now());

    Conversation saved =
            conversationRepository.save(conversation);

    // =========================================
    // websocket notify
    // =========================================

    List<ConversationMember> members =
            memberRepository.findByConversationId(conversationId);

    ConversationResponse response =
            toResponse(saved, userId);

    for (ConversationMember member : members) {

        messagingTemplate.convertAndSendToUser(
                member.getUserId().toString(),
                "/queue/group-update",
                response
        );
    }

    // 🔥 QUAN TRỌNG
    return response;
}


// =====================================================
// UPDATE GROUP NAME
// =====================================================

@Transactional
public ConversationResponse updateGroupName(
        UUID conversationId,
        UUID userId,
        String groupName
) {

    Conversation conversation = conversationRepository
            .findById(conversationId)
            .orElseThrow(() ->
                    new RuntimeException("Conversation not found"));

    // chỉ owner đổi tên nhóm
    if (!conversation.getCreatedBy().equals(userId)) {
        throw new RuntimeException("Bạn không có quyền đổi tên nhóm");
    }

    conversation.setName(groupName);
    conversation.setUpdatedAt(LocalDateTime.now());

    Conversation saved =
            conversationRepository.save(conversation);

    // =========================================
    // websocket notify
    // =========================================

    List<ConversationMember> members =
            memberRepository.findByConversationId(conversationId);

    ConversationResponse response =
            toResponse(saved, userId);

    for (ConversationMember member : members) {

        messagingTemplate.convertAndSendToUser(
                member.getUserId().toString(),
                "/queue/group-update",
                response
        );
    }

    // 🔥 QUAN TRỌNG
    return response;
}
    // =====================================================
    // LEAVE GROUP
    // =====================================================

    @Transactional
    public void leaveGroup(
            UUID conversationId,
            UUID userId
    ) {

        String userName =
                userRepository.findById(userId)

                        .map(u -> u.getFullName())

                        .orElse("Một thành viên");

        memberRepository
                .deleteByConversationIdAndUserId(
                        conversationId,
                        userId
                );

        Map<String, Object> notification =
                new HashMap<>();

        notification.put("type", "LEAVE_GROUP");
        notification.put("conversationId", conversationId);
        notification.put(
                "message",
                userName + " đã rời nhóm!!!"
        );

        List<ConversationMember> remainingMembers =
                memberRepository.findByConversationId(
                        conversationId
                );

        for (ConversationMember member : remainingMembers) {

            messagingTemplate.convertAndSendToUser(
                    member.getUserId().toString(),
                    "/queue/notifications",
                    notification
            );
        }
    }

    // =====================================================
    // DELETE GROUP
    // =====================================================

    @Transactional
    public void deleteConversation(
            UUID conversationId
    ) {

        // =============================================
        // DELETE MEMBERS
        // =============================================

        memberRepository.deleteByConversationId(
                conversationId
        );

        // =============================================
        // TODO DELETE MESSAGES
        // =============================================

        // messageRepository.deleteByConversationId(
        //      conversationId
        // );

        // =============================================
        // DELETE CONVERSATION
        // =============================================

        conversationRepository.deleteById(
                conversationId
        );
    }

    // =====================================================
    // SAVE MEMBER
    // =====================================================

    private void saveMember(
            UUID conversationId,
            UUID userId,
            String role
    ) {

        ConversationMember member =
                new ConversationMember();

        member.setConversationId(conversationId);
        member.setUserId(userId);
        member.setRole(role);
        member.setStatus("active");

        memberRepository.save(member);
    }

    // =====================================================
    // TO RESPONSE
    // =====================================================

private ConversationResponse toResponse(Conversation c,  UUID userId) {

    long memberCount = memberRepository.countByConversationId(c.getId());
    // Lấy danh sách tên thành viên từ repository
    List<String> memberNames = memberRepository.findUserNamesByConversationId(c.getId());
   // Lấy số tin nhắn hiện tại bằng 0

   long unreadCount = 0;

if (userId != null) {

    unreadCount =
            messageStatusRepository
                    .countUnreadByConversationAndUser(
                            c.getId(),
                            userId
                    );
}

return new ConversationResponse(
        c.getId(),
        c.getType(),
        c.getName(),
        c.getCreatedBy(),
        c.getCreatedAt(),
        null,
        null,
        unreadCount,
        c.getGroupAvatar(),
        memberCount,
        memberNames
);
}


//     // =====================================================
//     // SEARCH MEMBERS IN CONVERSATION (Tag thành viên trong nhóm)
//     // =====================================================

//     @Transactional(readOnly = true)
//     public List<com.chatapp.backend.user.dto.UserResponse> searchMembersInConversation(
//             UUID conversationId, 
//             String query
//     ) {
//         return memberRepository.findByConversationId(conversationId).stream()
//                 .map(member -> userRepository.findById(member.getUserId()).orElse(null))
//                 .filter(user -> user != null && 
//                         (user.getFullName().toLowerCase().contains(query.toLowerCase()) || 
//                          user.getUsername().toLowerCase().contains(query.toLowerCase())))
//                 .map(user -> new com.chatapp.backend.user.dto.UserResponse(
//                         user.getId(), 
//                         user.getUsername(), 
//                         user.getEmail(), // Cần bổ sung email
//                         user.getFullName(),
//                         user.getAvatarUrl(), // Giả sử entity dùng getAvatarUrl()
//                         user.getRole(),   // Cần bổ sung role
//                         user.getStatus(), // Cần bổ sung status
//                         user.getCreatedAt(), // Cần bổ sung createdAt
//                         null, // isUploadBlocked (không dùng trong tag)
//                         null  // isChatBlocked (không dùng trong tag)
//                 ))
//                 .collect(Collectors.toList());
//     }

    // =====================================================
    // SEARCH MEMBERS IN CONVERSATION (Tag thành viên trong nhóm)
    // =====================================================

    @Transactional(readOnly = true)
    public List<com.chatapp.backend.user.dto.UserResponse> searchMembersInConversation(
            UUID conversationId, 
            String query
    ) {
        // Sử dụng phương thức truy vấn tối ưu đã thêm vào ConversationMemberRepository
        // Việc lọc được thực hiện ngay tại Database thông qua câu lệnh JOIN
        try {
                return ConversationMemberRepository.searchUsersInConversation(conversationId, query)
                        .stream()
                        .map(user -> new com.chatapp.backend.user.dto.UserResponse(
                                user.getId(), 
                                user.getUsername(), 
                                user.getEmail(),
                                user.getFullName(),
                                user.getAvatarUrl(),
                                user.getRole(),
                                user.getStatus(),
                                user.getCreatedAt(),
                                null, // isUploadBlocked
                                null  // isChatBlocked
                        ))
                        .collect(Collectors.toList());
        } catch (Exception e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
        }
        return null;
    }

    // =====================================================
    // REMOVE MEMBER FROM GROUP
    // =====================================================

    @Transactional
    public void removeMemberFromGroup(UUID conversationId, UUID adminId, UUID memberId) {
        // 1. Lấy thông tin nhóm
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Nhóm không tồn tại"));

        // 2. Sử dụng helper để kiểm tra quyền nhóm trưởng
        validateGroupOwner(conversation, adminId);

        // 3. Kiểm tra xem nhóm trưởng có đang cố xóa chính mình không
        if (adminId.equals(memberId)) {
            throw new RuntimeException("Nhóm trưởng không thể tự xóa mình. Hãy chọn 'Rời nhóm'");
        }

        // 4. Thực hiện xóa thành viên
        memberRepository.deleteByConversationIdAndUserId(conversationId, memberId);

        // 5. Chuẩn bị thông báo
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "MEMBER_REMOVED");
        notification.put("conversationId", conversationId);
        notification.put("message", "Một thành viên đã bị nhóm trưởng loại khỏi nhóm.");
        
        // 6. Sử dụng helper để gửi thông báo cho các thành viên còn lại
        notifyGroupMembers(conversationId, "/queue/notifications", notification);
    
          // 7. 🔥 BỔ SUNG: Gửi thông báo riêng cho thành viên BỊ XÓA
    Map<String, Object> personalNotification = new HashMap<>();
    personalNotification.put("type", "YOU_WERE_REMOVED"); // Dùng type riêng để client nhận diện
    personalNotification.put("conversationId", conversationId);
    personalNotification.put("message", "Bạn đã bị xóa khỏi nhóm.");
    
    // Gửi trực tiếp đến người bị xóa bằng helper có sẵn
    messagingTemplate.convertAndSendToUser(
            memberId.toString(),
            "/queue/notifications", // Dùng cùng đường dẫn để Client dễ quản lý
            personalNotification
    );

}

    // =====================================================
    // 2. CÁC PHƯƠNG THỨC HELPER (Phải nằm ở đây, ngang hàng với các phương thức nghiệp vụ)
    // =====================================================

    private void validateGroupOwner(Conversation conversation, UUID userId) {
        if (!conversation.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền thực hiện thao tác này");
        }
    }

    private void notifyGroupMembers(UUID conversationId, String destination, Object payload) {
        List<ConversationMember> members = memberRepository.findByConversationId(conversationId);
        for (ConversationMember member : members) {
            messagingTemplate.convertAndSendToUser(
                    member.getUserId().toString(),
                    destination,
                    payload
            );
        }
    }
}