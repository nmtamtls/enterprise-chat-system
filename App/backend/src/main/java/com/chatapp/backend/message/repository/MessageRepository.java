// package com.chatapp.backend.message.repository;

// import com.chatapp.backend.message.entity.Message;

// import jakarta.transaction.Transactional;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Modifying;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// import java.util.List;
// import java.util.UUID;

// public interface MessageRepository extends JpaRepository<Message, UUID> {

//     List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

//     List<Message> findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID conversationId);

//     // 1. Xóa các bản ghi tin nhắn thuộc nhóm này
//     @Modifying
//     @Transactional
//     @Query("DELETE FROM Message m WHERE m.conversationId = :convId")
//     void deleteByConversationId(@Param("convId") UUID convId);
// }



// package com.chatapp.backend.message.repository;

// import com.chatapp.backend.message.entity.Message;
// import jakarta.transaction.Transactional;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.data.jpa.repository.Modifying;
// import org.springframework.data.jpa.repository.Query;
// import org.springframework.data.repository.query.Param;

// import java.util.List;
// import java.util.UUID;

// public interface MessageRepository extends JpaRepository<Message, UUID> {

//     // Lấy tất cả tin nhắn trong hội thoại
//     List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

//     // Lấy tin nhắn trong hội thoại (loại bỏ tin nhắn đã xóa)
//     List<Message> findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID conversationId);

//     // =====================================================
//     // CÁC PHƯƠNG THỨC HỖ TRỢ GHIM TIN NHẮN
//     // =====================================================

//     /**
//      * Lấy danh sách các tin nhắn đã ghim trong một hội thoại, 
//      * sắp xếp theo thời gian ghim mới nhất.
//      */
//     List<Message> findByConversationIdAndIsPinnedTrueOrderByPinnedAtDesc(UUID conversationId);

//     /**
//      * Ghim một tin nhắn cụ thể bằng cách cập nhật trạng thái và thời gian ghim.
//      */
//     @Modifying
//     @Transactional
//     @Query("UPDATE Message m SET m.isPinned = true, m.pinnedAt = CURRENT_TIMESTAMP WHERE m.id = :messageId")
//     void pinMessage(@Param("messageId") UUID messageId);

//     /**
//      * Bỏ ghim một tin nhắn cụ thể bằng cách reset trạng thái và thời gian ghim.
//      */
//     @Modifying
//     @Transactional
//     @Query("UPDATE Message m SET m.isPinned = false, m.pinnedAt = null WHERE m.id = :messageId")
//     void unpinMessage(@Param("messageId") UUID messageId);

//     // =====================================================

//     /**
//      * Xóa các bản ghi tin nhắn thuộc một cuộc hội thoại cụ thể.
//      */
//     @Modifying
//     @Transactional
//     @Query("DELETE FROM Message m WHERE m.conversationId = :convId")
//     void deleteByConversationId(@Param("convId") UUID convId);
// }


package com.chatapp.backend.message.repository;

import com.chatapp.backend.message.entity.Message;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    // =====================================================
    // GET MESSAGES
    // =====================================================

    /**
     * Lấy toàn bộ tin nhắn trong conversation
     */
    List<Message> findByConversationIdOrderByCreatedAtAsc(UUID conversationId);

    /**
     * Lấy toàn bộ tin nhắn chưa bị xoá
     */
    List<Message> findByConversationIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID conversationId);

    // =====================================================
    // PINNED MESSAGES
    // =====================================================

    /**
     * Lấy danh sách tin nhắn đã ghim
     */
    List<Message> findByConversationIdAndIsPinnedTrueOrderByPinnedAtDesc(
            UUID conversationId
    );

    /**
     * Đếm số lượng tin nhắn đã ghim
     */
    long countByConversationIdAndIsPinnedTrue(UUID conversationId);

    // =====================================================
    // DELETE
    // =====================================================

    /**
     * Xoá toàn bộ tin nhắn thuộc conversation
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM Message m WHERE m.conversationId = :convId")
    void deleteByConversationId(@Param("convId") UUID convId);
}