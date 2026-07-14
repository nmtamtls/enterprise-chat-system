package com.chatapp.backend.contact.controller;

import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.contact.dto.AddContactRequest;
import com.chatapp.backend.contact.dto.ContactResponse;
import com.chatapp.backend.contact.service.ContactService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/contacts")
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // 1. Lấy danh sách bạn bè đã kết bạn
    @GetMapping("/{userId}")
    public ApiResponse<List<ContactResponse>> getFriends(@PathVariable UUID userId) {
        return new ApiResponse<>(true, "OK", contactService.getFriends(userId));
    }

    // 2. Lấy danh sách lời mời kết bạn đang chờ
    @GetMapping("/requests/{userId}")
    public ApiResponse<List<ContactResponse>> getPendingRequests(@PathVariable UUID userId) {
        return new ApiResponse<>(true, "OK", contactService.getPendingRequests(userId));
    }

    // 3. Gửi lời mời kết bạn
    @PostMapping("/{userId}")
    public ApiResponse<ContactResponse> add(
            @PathVariable UUID userId,
            @RequestBody AddContactRequest req
    ) {
        return new ApiResponse<>(true, "Added", contactService.addFriend(userId, req.getContactUserId()));
    }

    // 4. Chấp nhận kết bạn
    @PutMapping("/accept/{contactId}")
    public ApiResponse<String> accept(@PathVariable UUID contactId) {
        contactService.acceptFriendRequest(contactId);
        return new ApiResponse<>(true, "Accepted", null);
    }
    
    // 5. Từ chối hoặc Hủy kết bạn theo ID bản ghi liên hệ
    @DeleteMapping("/{contactId}")
    public ApiResponse<String> delete(@PathVariable UUID contactId) {
        contactService.deleteContact(contactId);
        return new ApiResponse<>(true, "Deleted", null);
    }

    // 6. Hủy kết bạn dựa vào cặp userId và friendId (ĐÃ SỬA TÊN HÀM SERVICE CHO KHỚP)
    @DeleteMapping("/unfriend/{userId}/{friendId}")
    public ApiResponse<String> unfriend(
            @PathVariable UUID userId,
            @PathVariable UUID friendId
    ) {
        contactService.removeFriendRequest(userId, friendId); // Đổi từ removeFriendRequest thành unfriend cho đồng bộ
        return new ApiResponse<>(true, "Removed", null);
    }

    // 7. Lấy danh sách những người dùng đã chặn
    @GetMapping("/blocked-list/{userId}")
    public ApiResponse<List<ContactResponse>> getBlockedList(@PathVariable UUID userId) {
        return new ApiResponse<>(true, "OK", contactService.getBlockedList(userId));
    }

    // 8. Chặn người dùng (MỚI BỔ SUNG - Khớp với axios.put ở Frontend)
    @PutMapping("/block/{blockerId}/{blockedId}")
    public ApiResponse<String> blockUser(
            @PathVariable UUID blockerId,
            @PathVariable UUID blockedId
    ) {
        contactService.blockUser(blockerId, blockedId);
        return new ApiResponse<>(true, "Chặn người dùng thành công", null);
    }

    // 9. Gỡ chặn người dùng (MỚI BỔ SUNG - Khớp với axios.put ở Frontend)
    @PutMapping("/unblock/{blockerId}/{blockedId}")
    public ApiResponse<String> unblockUser(
            @PathVariable UUID blockerId,
            @PathVariable UUID blockedId
    ) {
        contactService.unblockUser(blockerId, blockedId);
        return new ApiResponse<>(true, "Gỡ chặn thành công", null);
    }
}