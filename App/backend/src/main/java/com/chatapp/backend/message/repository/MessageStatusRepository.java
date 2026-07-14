package com.chatapp.backend.message.repository;

import com.chatapp.backend.message.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageStatusRepository extends JpaRepository<MessageStatus, UUID> {
    
    // Thêm dòng này để tìm tất cả trạng thái của 1 tin nhắn
    List<MessageStatus> findAllByMessageId(UUID messageId);
    
    // Đảm bảo bạn cũng có hàm này (mà bạn đã dùng ở các hàm trước)
    Optional<MessageStatus> findByMessageIdAndUserId(UUID messageId, UUID userId);

    // Thêm hàm này nếu bạn dùng trong processPendingMessages
    List<MessageStatus> findAllByUserIdAndStatus(UUID userId, String status);

    //  Đếm số tin nhắn sent (unread/sent)
    long countByUserIdAndStatus(UUID userId, String status);

    // Đếm unread gồm sent + delivered
    long countByUserIdAndStatusIn(UUID userId, List<String> statuses);

    @Query("""
    SELECT COUNT(ms)
    FROM MessageStatus ms
    JOIN Message m ON ms.messageId = m.id
    WHERE ms.userId = :userId
    AND m.conversationId = :conversationId
    AND ms.status = 'sent'
""")
long countUnreadByConversationAndUser(
        @Param("conversationId") UUID conversationId,
        @Param("userId") UUID userId
);
@Query("""
SELECT COUNT(ms)
FROM MessageStatus ms
JOIN Message m ON m.id = ms.messageId
WHERE ms.userId = :userId
AND m.conversationId = :conversationId
AND ms.status = 'sent'
""")
long countUnreadByConversation(
        @Param("userId") UUID userId,
        @Param("conversationId") UUID conversationId
);
}