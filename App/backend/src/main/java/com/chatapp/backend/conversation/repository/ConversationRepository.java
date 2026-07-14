

package com.chatapp.backend.conversation.repository;

import com.chatapp.backend.conversation.entity.Conversation;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ConversationRepository
        extends JpaRepository<Conversation, UUID> {

    /**
     * =====================================================
     * LẤY TOÀN BỘ HỘI THOẠI USER ĐÃ THAM GIA
     * =====================================================
     */
    @Query("""
        SELECT DISTINCT c
        FROM Conversation c
        JOIN ConversationMember cm
            ON c.id = cm.conversationId
        WHERE cm.userId = :userId
        ORDER BY c.updatedAt DESC
    """)
    List<Conversation> findAllJoinedConversations(
            @Param("userId") UUID userId
    );

    /**
     * =====================================================
     * TÌM GROUP THEO ID
     * =====================================================
     */
    @Query("""
        SELECT c
        FROM Conversation c
        WHERE c.id = :conversationId
        AND c.type = 'GROUP'
    """)
    Optional<Conversation> findGroupById(
            @Param("conversationId") UUID conversationId
    );

    /**
     * =====================================================
     * UPDATE GROUP AVATAR
     * =====================================================
     */
    @Modifying
    @Query("""
        UPDATE Conversation c
        SET c.groupAvatar = :avatar,
            c.updatedAt = CURRENT_TIMESTAMP
        WHERE c.id = :conversationId
    """)
    void updateGroupAvatar(
            @Param("conversationId") UUID conversationId,
            @Param("avatar") String avatar
    );

    /**
     * =====================================================
     * UPDATE GROUP NAME
     * =====================================================
     */
    @Modifying
    @Query("""
        UPDATE Conversation c
        SET c.name = :name,
            c.updatedAt = CURRENT_TIMESTAMP
        WHERE c.id = :conversationId
    """)
    void updateGroupName(
            @Param("conversationId") UUID conversationId,
            @Param("name") String name
    );

    /**
     * =====================================================
     * CHECK USER CÓ PHẢI OWNER KHÔNG
     * =====================================================
     */
    @Query("""
        SELECT COUNT(c) > 0
        FROM Conversation c
        WHERE c.id = :conversationId
        AND c.createdBy = :userId
    """)
    boolean isGroupOwner(
            @Param("conversationId") UUID conversationId,
            @Param("userId") UUID userId
    );

    /**
     * =====================================================
     * LẤY TẤT CẢ GROUP USER TẠO
     * =====================================================
     */
    List<Conversation> findByCreatedBy(UUID createdBy);

    /**
     * =====================================================
     * ĐẾM SỐ NHÓM
     * =====================================================
     */
    long countByType(String type);

    /**
     * =====================================================
     * CẬP NHẬT THỜI GIAN HOẠT ĐỘNG CUỐI CÙNG CỦA NHÓM
     * (Dùng khi có thành viên mới hoặc khi xóa thành viên)
     * =====================================================
     */
    @Modifying
    @Query("""
        UPDATE Conversation c
        SET c.updatedAt = CURRENT_TIMESTAMP
        WHERE c.id = :conversationId
    """)
    void updateGroupActivity(@Param("conversationId") UUID conversationId);

    /**
     * =====================================================
     * TÌM NHÓM VÀ KIỂM TRA SỰ TỒN TẠI
     * =====================================================
     */
    boolean existsByIdAndType(UUID id, String type);
}