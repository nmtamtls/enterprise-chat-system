// package com.chatapp.backend.contact.repository;

// import com.chatapp.backend.contact.entity.Contact;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// import java.util.List;
// import java.util.Optional;
// import java.util.UUID;

// public interface ContactRepository extends JpaRepository<Contact, UUID> {

//     // Lấy danh sách quan hệ theo userId và trạng thái (ACCEPTED, PENDING,...)
//     List<Contact> findByUserIdAndStatus(UUID userId, String status);

//     // Kiểm tra xem đã tồn tại mối quan hệ giữa 2 user chưa (nên kiểm tra cả 2 chiều)
//     @Query("SELECT COUNT(c) > 0 FROM Contact c WHERE " +
//            "(c.userId = :u1 AND c.contactUserId = :u2) OR " +
//            "(c.userId = :u2 AND c.contactUserId = :u1)")
//     boolean existsBetween(@Param("u1") UUID u1, @Param("u2") UUID u2);

//     // FIX LỖI ĐỐI XỨNG: Lấy ID bạn bè bất kể user đứng ở cột nào
//     // Logic: Nếu tôi là userId thì lấy contactUserId, ngược lại nếu tôi là contactUserId thì lấy userId
//     @Query("SELECT CASE WHEN c.userId = :userId THEN c.contactUserId ELSE c.userId END " +
//            "FROM Contact c WHERE (c.userId = :userId OR c.contactUserId = :userId) " +
//            "AND LOWER(c.status) = 'accepted'")
//     List<UUID> findAcceptedContactIdsByUserId(@Param("userId") UUID userId);

//     // Tìm một quan hệ cụ thể (nên dùng cho việc Update status hoặc Xóa)
//     @Query("SELECT c FROM Contact c WHERE " +
//            "(c.userId = :u1 AND c.contactUserId = :u2) OR " +
//            "(c.userId = :u2 AND c.contactUserId = :u1)")
//     Optional<Contact> findSpecificContact(@Param("u1") UUID u1, @Param("u2") UUID u2);

//     boolean existsByUserIdAndContactUserId(UUID userId, UUID contactUserId);
// }


package com.chatapp.backend.contact.repository;

import com.chatapp.backend.contact.dto.ContactResponse;
import com.chatapp.backend.contact.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContactRepository extends JpaRepository<Contact, UUID> {

    // Lấy danh sách lời mời gửi ĐẾN cho người dùng (để hiển thị nút Accept/Decline)
    @Query("SELECT new com.chatapp.backend.contact.dto.ContactResponse(" +
           "CAST(c.id AS string), u.username, u.fullName, u.avatarUrl, false) " +
           "FROM Contact c JOIN User u ON c.userId = u.id " +
           "WHERE c.contactUserId = :receiverId AND LOWER(c.status) = 'pending'")
    List<ContactResponse> findIncomingRequestsWithSenderInfo(@Param("receiverId") UUID receiverId);

    // Kiểm tra tồn tại quan hệ giữa 2 người
    @Query("SELECT COUNT(c) > 0 FROM Contact c WHERE " +
           "(c.userId = :u1 AND c.contactUserId = :u2) OR " +
           "(c.userId = :u2 AND c.contactUserId = :u1)")
    boolean existsBetween(@Param("u1") UUID u1, @Param("u2") UUID u2);

    // Lấy ID những người đã kết bạn (ACCEPTED)
    @Query("SELECT CASE WHEN c.userId = :userId THEN c.contactUserId ELSE c.userId END " +
           "FROM Contact c WHERE (c.userId = :userId OR c.contactUserId = :userId) " +
           "AND LOWER(c.status) = 'accepted'")
    List<UUID> findAcceptedContactIdsByUserId(@Param("userId") UUID userId);

    // Tìm quan hệ cụ thể để xử lý Chấp nhận/Từ chối
    @Query("SELECT c FROM Contact c WHERE " +
           "(c.userId = :u1 AND c.contactUserId = :u2) OR " +
           "(c.userId = :u2 AND c.contactUserId = :u1)")
    Optional<Contact> findSpecificContact(@Param("u1") UUID u1, @Param("u2") UUID u2);

    boolean existsByUserIdAndContactUserId(UUID userId, UUID contactUserId);

    // ================= MỚI BỔ SUNG ĐỂ SỬA LỖI =================
    // Chú thích @Modifying bắt buộc phải có đối với câu lệnh DELETE/UPDATE trong JPQL
    @Modifying
    @Query("DELETE FROM Contact c WHERE (c.userId = :userId AND c.contactUserId = :friendId) " +
           "OR (c.userId = :friendId AND c.contactUserId = :userId)")
    void deleteFriendship(@Param("userId") UUID userId, @Param("friendId") UUID friendId);

// ================= KHU VỰC CHỨC NĂNG CHẶN (BLOCK / UNBLOCK) =================

    // 1. Chuyển đổi từ bạn bè/pending sang chặn (Ghi đè user_id thành người chủ động chặn để thỏa mãn UNIQUE INDEX)
    @org.springframework.transaction.annotation.Transactional // Bắt buộc phải có Transactional khi dùng @Modifying
    @Modifying
    @Query("UPDATE Contact c SET c.status = 'blocked', c.userId = :blockerId, c.contactUserId = :blockedId " +
           "WHERE (c.userId = :blockerId AND c.contactUserId = :blockedId) " +
           "OR (c.userId = :blockedId AND c.contactUserId = :blockerId)")
    void updateToBlocked(@Param("blockerId") UUID blockerId, @Param("blockedId") UUID blockedId);

    // 2. Kiểm xem mối quan hệ chặn này có phải do chính Blocker tạo ra hay không (Dùng khi Unblock)
    @Query("SELECT c FROM Contact c WHERE c.userId = :blockerId AND c.contactUserId = :blockedId AND LOWER(c.status) = 'blocked'")
    java.util.Optional<Contact> findSpecificBlocked(@Param("blockerId") UUID blockerId, @Param("blockedId") UUID blockedId);

    // 3. Tìm danh sách những người bị chặn bởi chính User này (Để nạp vào hàm getBlockedList)
    @Query("SELECT c FROM Contact c WHERE c.userId = :userId AND LOWER(c.status) = 'blocked'")
    List<Contact> findBlockedByUserId(@Param("userId") UUID userId);

    // 4. Kiểm tra xem giữa 2 người có ai đang chặn ai hay không (u1 hoặc u2 chặn đối phương)
    @Query("SELECT COUNT(c) > 0 FROM Contact c WHERE " +
           "((c.userId = :u1 AND c.contactUserId = :u2) OR (c.userId = :u2 AND c.contactUserId = :u1)) " +
           "AND LOWER(c.status) = 'blocked'")
    boolean isBlockedEitherWay(@Param("u1") UUID u1, @Param("u2") UUID u2);

}