// package com.chatapp.backend.contact.service;

// import com.chatapp.backend.contact.dto.ContactResponse;
// import com.chatapp.backend.contact.entity.Contact;
// import com.chatapp.backend.contact.repository.ContactRepository;
// import com.chatapp.backend.presence.service.PresenceService;
// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;
// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.UUID;

// @Service
// public class ContactService {

//     private final ContactRepository contactRepository;
//     private final UserRepository userRepository;
//     private final PresenceService presenceService;

//     public ContactService(ContactRepository contactRepository,
//                           UserRepository userRepository,
//                           PresenceService presenceService) {
//         this.contactRepository = contactRepository;
//         this.userRepository = userRepository;
//         this.presenceService = presenceService;
//     }

//     // ===== LẤY DANH SÁCH BẠN =====
//     public List<ContactResponse> getFriends(UUID userId) {

//         return contactRepository.findAll()
//                 .stream()
//                 .filter(c ->
//                         (c.getUserId().equals(userId) || c.getContactUserId().equals(userId))
//                                 && "accepted".equalsIgnoreCase(c.getStatus())
//                 )
//                 .map(c -> {

//                     // xác định người còn lại (friend)
//                     UUID friendId = c.getUserId().equals(userId)
//                             ? c.getContactUserId()
//                             : c.getUserId();

//                     User user = userRepository.findById(friendId)
//                             .orElseThrow(() -> new RuntimeException("User not found"));

//                     //dùng service (đúng chuẩn)
//                     boolean isOnline = presenceService.isOnline(friendId);

//                     return new ContactResponse(
//                             user.getId().toString(),
//                             user.getUsername(),
//                             user.getFullName(),
//                             user.getAvatarUrl(),
//                             isOnline
//                     );
//                 })
//                 .toList();
//     }

//     // ===== THÊM BẠN =====
//     public ContactResponse addFriend(UUID userId, UUID contactUserId) {

//         if (contactRepository.existsByUserIdAndContactUserId(userId, contactUserId)
//                 || contactRepository.existsByUserIdAndContactUserId(contactUserId, userId)) {
//             throw new RuntimeException("Already added");
//         }

//         Contact contact = new Contact();
//         contact.setUserId(userId);
//         contact.setContactUserId(contactUserId);
//         contact.setStatus("pending");

//         contactRepository.save(contact);

//         return new ContactResponse(
//                 contactUserId.toString(),
//                 null,
//                 null,
//                 null,
//                 false
//         );
//     }

//     // ===== ACCEPT =====
//     public void accept(UUID contactId) {
//         Contact contact = contactRepository.findById(contactId)
//                 .orElseThrow(() -> new RuntimeException("Not found"));

//         contact.setStatus("accepted");
//         contactRepository.save(contact);
//     }
// }





package com.chatapp.backend.contact.service;

import com.chatapp.backend.contact.dto.ContactResponse;
import com.chatapp.backend.contact.entity.Contact;
import com.chatapp.backend.contact.repository.ContactRepository;
import com.chatapp.backend.presence.service.PresenceService;
import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ContactService {

    private final ContactRepository contactRepository;
    private final UserRepository userRepository;
    private final PresenceService presenceService;
    private final SimpMessagingTemplate messagingTemplate;

    public ContactService(ContactRepository contactRepository,
                          UserRepository userRepository,
                          PresenceService presenceService,
                          SimpMessagingTemplate messagingTemplate) {
        this.contactRepository = contactRepository;
        this.userRepository = userRepository;
        this.presenceService = presenceService;
        this.messagingTemplate = messagingTemplate;
    }

    // ===== 1. LẤY DANH SÁCH BẠN BÈ =====
    public List<ContactResponse> getFriends(UUID userId) {
        List<UUID> friendIds = contactRepository.findAcceptedContactIdsByUserId(userId);

        return friendIds.stream()
                .map(friendId -> {
                    User friend = userRepository.findById(friendId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + friendId));

                    return new ContactResponse(
                            friend.getId().toString(),
                            friend.getUsername(),
                            friend.getFullName(),
                            friend.getAvatarUrl(),
                            presenceService.isOnline(friendId)
                    );
                })
                .collect(Collectors.toList());
    }

    // ===== 2. LẤY DANH SÁCH LỜI MỜI KẾT BẠN (Dùng Query Projection tối ưu) =====
    public List<ContactResponse> getPendingRequests(UUID myId) {
        return contactRepository.findIncomingRequestsWithSenderInfo(myId);
    }

    // ===== 3. GỬI LỜI MỜI KẾT BẠN (Real-time) =====
    @Transactional
    public ContactResponse addFriend(UUID userId, UUID contactUserId) {
        if (userId.equals(contactUserId)) {
            throw new RuntimeException("You cannot add yourself as a friend");
        }

        if (contactRepository.existsBetween(userId, contactUserId)) {
            throw new RuntimeException("Friend request already exists or you are already friends");
        }

        // 1. Lưu vào Database và ép Hibernate Flush dữ liệu ngay lập tức
        Contact contact = new Contact();
        contact.setUserId(userId);
        contact.setContactUserId(contactUserId);
        contact.setStatus("pending");
        
        // Dùng saveAndFlush để đảm bảo bản ghi có sẵn trong DB trước khi gửi thông báo
        Contact savedContact = contactRepository.saveAndFlush(contact);

        // 2. Lấy thông tin người gửi để đóng gói vào thông báo
        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // 3. Tạo Notification DTO (Đảm bảo Class ContactResponse đã có No-args Constructor)
        ContactResponse notification = new ContactResponse(
                savedContact.getId().toString(), // Trả về ID của bản ghi Contact
                sender.getUsername(),
                sender.getFullName(),
                sender.getAvatarUrl(),
                true 
        );

        // 4. GỬI REAL-TIME QUA WEBSOCKET
        try {
            // Spring sẽ gửi đến /user/{contactUserId}/queue/notifications
            messagingTemplate.convertAndSendToUser(
                    contactUserId.toString(),
                    "/queue/notifications",
                    notification
            );
            System.out.println("Real-time notification sent to user: " + contactUserId);
        } catch (Exception e) {
            // Catch lỗi để không làm rollback Transaction chính nếu WebSocket gặp sự cố nhẹ
            System.err.println("WebSocket Notification failed: " + e.getMessage());
        }

        return notification;
    }

    // ===== 4. CHẤP NHẬN LỜI MỜI =====
    // @Transactional
    // public void acceptFriendRequest(UUID contactId) {
    //     Contact contact = contactRepository.findById(contactId)
    //             .orElseThrow(() -> new RuntimeException("Friend request not found"));

    //     if (!"pending".equalsIgnoreCase(contact.getStatus())) {
    //         throw new RuntimeException("Request is not in pending status");
    //     }

    //     contact.setStatus("accepted");
    //     contactRepository.save(contact);
    // }

    // ===== 4. CHẤP NHẬN LỜI MỜI (Đồng bộ Real-time cho cả 2 bên) =====
    @Transactional
    public void acceptFriendRequest(UUID contactId) {
        Contact contact = contactRepository.findById(contactId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!"pending".equalsIgnoreCase(contact.getStatus())) {
            throw new RuntimeException("Request is not in pending status");
        }

        contact.setStatus("accepted");
        
        // SỬA TẠI ĐÂY: Bỏ phần khai báo "Contact savedContact =" đi để hết cảnh báo lãng phí biến
        contactRepository.saveAndFlush(contact); 

        // contact.getUserId() là NGƯỜI GỬI lời mời ban đầu (đang đợi phản hồi)
        UUID senderId = contact.getUserId();
        // contact.getContactUserId() là NGƯỜI NHẬN (người vừa bấm Chấp nhận)
        UUID receiverId = contact.getContactUserId();

        // Lấy thông tin người nhận (người vừa đồng ý) để gửi qua socket cho người gửi vẽ lên UI
        User receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        boolean isReceiverOnline = presenceService.isOnline(receiverId);

        // Tạo payload đồng bộ với cấu trúc Frontend đang đợi
        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("type", "FRIEND_ACCEPTED"); 
        payload.put("id", receiver.getId().toString());
        payload.put("username", receiver.getUsername());
        payload.put("fullName", receiver.getFullName());
        payload.put("avatarUrl", receiver.getAvatarUrl());
        payload.put("online", isReceiverOnline);

        // BẮN REAL-TIME ĐẾN NGƯỜI GỬI (senderId)
        try {
            messagingTemplate.convertAndSendToUser(
                    senderId.toString(),
                    "/queue/notifications",
                    payload
            );
            System.out.println("Real-time notification [FRIEND_ACCEPTED] sent to sender: " + senderId);
        } catch (Exception e) {
            System.err.println("WebSocket Friend Acceptance Notification failed: " + e.getMessage());
        }
    }

    // ===== 5. TỪ CHỐI / HỦY KẾT BẠN =====
    @Transactional
    public void deleteContact(UUID contactId) {
        if (!contactRepository.existsById(contactId)) {
            throw new RuntimeException("Contact not found");
        }
        contactRepository.deleteById(contactId);
    }

    // // ===== 6. HỦY KẾT BẠN THEO CẶP USER ID VÀ FRIEND ID (MỚI BỔ SUNG) =====
    // @Transactional
    // public void removeFriendRequest(UUID userId, UUID friendId) {
    //     // Tìm bản ghi chứa mối quan hệ giữa 2 người (bất kể ai gửi trước) ở trạng thái 'accepted'
    //     // Bạn có thể tùy biến dùng Custom Query hoặc Spring Data JPA Method (Nếu đã định nghĩa trong Repository)
    //     // Dưới đây là cách xóa trực tiếp thông qua việc gọi hàm Repository xử lý câu Query xóa.
    //     try {
    //         contactRepository.deleteFriendship(userId, friendId);
    //         System.out.println("Successfully unfriended between: " + userId + " and " + friendId);
    //     } catch (Exception e) {
    //         throw new RuntimeException("Lỗi khi hủy kết bạn: " + e.getMessage());
    //     }
    // }

    // ===== 6. HỦY KẾT BẠN THEO CẶP USER ID VÀ FRIEND ID (Cập nhật Real-time) =====
    @Transactional
    public void removeFriendRequest(UUID userId, UUID friendId) {
        try {
            // 1. Thực hiện xóa bản ghi kết bạn dưới DB
            contactRepository.deleteFriendship(userId, friendId);
            System.out.println("Successfully unfriended between: " + userId + " and " + friendId);

            // 2. Tạo gói tin để thông báo Real-time cho người kia (friendId) biết họ vừa bị hủy kết bạn
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", "FRIEND_REMOVED");
            payload.put("id", userId.toString()); // Gửi kèm ID của người chủ động hủy kết bạn

            // 3. BẮN REAL-TIME QUA WEBSOCKET ĐẾN ĐỐI PHƯƠNG (friendId)
            messagingTemplate.convertAndSendToUser(
                    friendId.toString(),
                    "/queue/notifications",
                    payload
            );
            System.out.println("Real-time notification [FRIEND_REMOVED] sent to user: " + friendId);

        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi hủy kết bạn: " + e.getMessage());
        }
    }
// // ===== 7. CHẶN NGƯỜI DÙNG (CÓ XỬ LÝ UNIQUE INDEX) =====
//     @Transactional
//     public void blockUser(UUID blockerId, UUID blockedId) {
//         if (blockerId.equals(blockedId)) {
//             throw new RuntimeException("Bạn không thể tự chặn chính mình");
//         }

//         // Trường hợp 1: Chưa từng có quan hệ (Người lạ chặn nhau)
//         if (!contactRepository.existsBetween(blockerId, blockedId)) {
//             Contact newBlock = new Contact();
//             newBlock.setUserId(blockerId);
//             newBlock.setContactUserId(blockedId);
//             newBlock.setStatus("blocked");
//             contactRepository.save(newBlock);
//         } else {
//             // Trường hợp 2: Đã có bản ghi (Đang là bạn bè hoặc đang chờ kết bạn)
//             Optional<Contact> currentRelation = contactRepository.findSpecificContact(blockerId, blockedId);
//             if (currentRelation.isPresent() && "blocked".equalsIgnoreCase(currentRelation.get().getStatus())) {
//                 // Nếu bản ghi đã là 'blocked' và user_id bằng blockedId chứng tỏ người kia đã chặn mình trước đó rồi
//                 if (currentRelation.get().getUserId().equals(blockedId)) {
//                      System.out.println("Đối phương đã chặn bạn trước, giữ nguyên trạng thái block chéo.");
//                      return;
//                 }
//                 throw new RuntimeException("Bạn đã chặn người dùng này rồi");
//             }
            
//             // Tiến hành cập nhật trạng thái kết bạn thành 'blocked'
//             contactRepository.updateToBlocked(blockerId, blockedId);
//         }
//     }

//     // ===== 8. GỠ CHẶN NGƯỜI DÙNG =====
//     @Transactional
//     public void unblockUser(UUID blockerId, UUID blockedId) {
//         // Tìm bản ghi chặn mà TRONG ĐÓ blockerId phải đóng vai trò là c.userId (người chủ động chặn)
//         Contact contact = contactRepository.findSpecificBlocked(blockerId, blockedId)
//                 .orElseThrow(() -> new RuntimeException("Bạn không thể gỡ chặn người này (Có thể họ đang chặn bạn hoặc không có bản ghi chặn)"));

//         // Vì ràng buộc UNIQUE INDEX, sau khi gỡ chặn, mối quan hệ sẽ bị xóa hẳn để đưa nhau về trạng thái "Người lạ"
//         contactRepository.delete(contact);
//     }

//     // ===== 9. LẤY DANH SÁCH LIÊN HỆ ĐÃ CHẶN (ĐÃ SỬA DÙNG SETTER TRÁNH LỖI 500) =====
//     public List<ContactResponse> getBlockedList(UUID userId) {
//         List<Contact> blockedContacts = contactRepository.findBlockedByUserId(userId);

//         return blockedContacts.stream()
//                 .map(contact -> {
//                     // Người bị chặn nằm ở trường contactUserId
//                     UUID blockedId = contact.getContactUserId();
//                     User blockedUser = userRepository.findById(blockedId)
//                             .orElseThrow(() -> new RuntimeException("User not found: " + blockedId));

//                     // Dùng constructor không tham số và điền dữ liệu bằng Setter để đảm bảo an toàn tuyệt đối
//                     ContactResponse response = new ContactResponse();
//                     response.setId(blockedUser.getId().toString());
//                     response.setUsername(blockedUser.getUsername());
//                     response.setFullName(blockedUser.getFullName()); // Sử dụng CamelCase đồng bộ với DTO của bạn
//                     response.setAvatarUrl(blockedUser.getAvatarUrl()); 
//                     response.setOnline(false); // Ép trạng thái ẩn đối với danh sách chặn

//                     return response;
//                 })
//                 .collect(Collectors.toList());
//     }

//     // Hàm hỗ trợ kiểm tra chặn chéo dùng cho việc chặn tin nhắn
//     public boolean isBlockedBetween(UUID user1, UUID user2) {
//         return contactRepository.isBlockedEitherWay(user1, user2);
//     }
// ===== 7. CHẶN NGƯỜI DÙNG (CÓ XỬ LÝ UNIQUE INDEX & WEBSOCKET) =====
    @Transactional
    public void blockUser(UUID blockerId, UUID blockedId) {
        if (blockerId.equals(blockedId)) {
            throw new RuntimeException("Bạn không thể tự chặn chính mình");
        }

        // Trường hợp 1: Chưa từng có quan hệ (Người lạ chặn nhau)
        if (!contactRepository.existsBetween(blockerId, blockedId)) {
            Contact newBlock = new Contact();
            newBlock.setUserId(blockerId);
            newBlock.setContactUserId(blockedId);
            newBlock.setStatus("blocked");
            contactRepository.saveAndFlush(newBlock);
        } else {
            // Trường hợp 2: Đã có bản ghi (Đang là bạn bè hoặc đang chờ kết bạn)
            Optional<Contact> currentRelation = contactRepository.findSpecificContact(blockerId, blockedId);
            if (currentRelation.isPresent() && "blocked".equalsIgnoreCase(currentRelation.get().getStatus())) {
                // Nếu bản ghi đã là 'blocked' và user_id bằng blockedId chứng tỏ người kia đã chặn mình trước đó rồi
                if (currentRelation.get().getUserId().equals(blockedId)) {
                     System.out.println("Đối phương đã chặn bạn trước, giữ nguyên trạng thái block chéo.");
                     return;
                }
                throw new RuntimeException("Bạn đã chặn người dùng này rồi");
            }
            
            // Tiến hành cập nhật trạng thái kết bạn thành 'blocked'
            contactRepository.updateToBlocked(blockerId, blockedId);
        }

        // 🔥 BẮN WEBSOCKET REAL-TIME SANG NGƯỜI BỊ CHẶN (blockedId)
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", "USER_BLOCKED");
            payload.put("id", blockerId.toString()); // Gửi ID của người chặn để FE đối phương xóa khỏi danh sách bạn bè

            messagingTemplate.convertAndSendToUser(
                    blockedId.toString(),
                    "/queue/notifications",
                    payload
            );
            System.out.println("Real-time notification [USER_BLOCKED] sent to: " + blockedId);
        } catch (Exception e) {
            System.err.println("WebSocket Block Notification failed: " + e.getMessage());
        }
    }

    // ===== 8. GỠ CHẶN NGƯỜI DÙNG (BỔ SUNG WEBSOCKET REAL-TIME) =====
    @Transactional
    public void unblockUser(UUID blockerId, UUID blockedId) {
        // Tìm bản ghi chặn mà TRONG ĐÓ blockerId phải đóng vai trò là c.userId (người chủ động chặn)
        Contact contact = contactRepository.findSpecificBlocked(blockerId, blockedId)
                .orElseThrow(() -> new RuntimeException("Bạn không thể gỡ chặn người này (Có thể họ đang chặn bạn hoặc không có bản ghi chặn)"));

        // Vì ràng buộc UNIQUE INDEX, sau khi gỡ chặn, mối quan hệ sẽ bị xóa hẳn để đưa nhau về trạng thái "Người lạ"
        contactRepository.delete(contact);

        // 🔥 BẮN WEBSOCKET REAL-TIME SANG NGƯỜI ĐƯỢC GỠ CHẶN (blockedId)
        try {
            java.util.Map<String, Object> payload = new java.util.HashMap<>();
            payload.put("type", "USER_UNBLOCKED");
            payload.put("id", blockerId.toString()); // Gửi ID của người gỡ chặn

            messagingTemplate.convertAndSendToUser(
                    blockedId.toString(),
                    "/queue/notifications",
                    payload
            );
            System.out.println("Real-time notification [USER_UNBLOCKED] sent to: " + blockedId);
        } catch (Exception e) {
            System.err.println("WebSocket Unblock Notification failed: " + e.getMessage());
        }
    }

    // ===== 9. LẤY DANH SÁCH LIÊN HỆ ĐÃ CHẶN (Bảo toàn Logic Tránh lỗi 500) =====
    public List<ContactResponse> getBlockedList(UUID userId) {
        List<Contact> blockedContacts = contactRepository.findBlockedByUserId(userId);

        return blockedContacts.stream()
                .map(contact -> {
                    // Người bị chặn nằm ở trường contactUserId hoặc userId tuỳ thuộc vào ai là người block
                    // Nhưng theo logic hàm blockUser của bạn: blockerId -> userId, blockedId -> contactUserId
                    UUID blockedId = contact.getContactUserId();
                    User blockedUser = userRepository.findById(blockedId)
                            .orElseThrow(() -> new RuntimeException("User not found: " + blockedId));

                    ContactResponse response = new ContactResponse();
                    response.setId(blockedUser.getId().toString());
                    response.setUsername(blockedUser.getUsername());
                    response.setFullName(blockedUser.getFullName()); 
                    response.setAvatarUrl(blockedUser.getAvatarUrl()); 
                    response.setOnline(false); // Luôn ẩn trạng thái online trong danh sách đen

                    return response;
                })
                .collect(Collectors.toList());
    }
    // ===== BỔ SUNG HÀM NÀY VÀO CUỐI FILE ContactService.java =====
    public boolean isBlockedBetween(UUID user1, UUID user2) {
        return contactRepository.isBlockedEitherWay(user1, user2);
    }
}