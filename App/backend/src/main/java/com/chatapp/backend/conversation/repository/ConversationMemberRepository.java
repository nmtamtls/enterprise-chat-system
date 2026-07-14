package com.chatapp.backend.conversation.repository;

import com.chatapp.backend.conversation.entity.ConversationMember;
import com.chatapp.backend.user.entity.User;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationMemberRepository extends JpaRepository<ConversationMember, UUID> {

    // ================= DELETE MEMBER FROM CONVERSATION =================
    @Modifying
    @Transactional
    @Query("DELETE FROM ConversationMember cm WHERE cm.conversationId = :convId AND cm.userId = :userId")
    void deleteByConversationIdAndUserId(@Param("convId") UUID convId, @Param("userId") UUID userId);

    // ================= BỔ SUNG ĐỂ GIẢI TÁN NHÓM =================
    @Modifying
    @Transactional
    @Query("DELETE FROM ConversationMember cm WHERE cm.conversationId = :convId")
    void deleteByConversationId(@Param("convId") UUID convId);

    // Thêm vào trong ConversationMemberRepository.java
    @Query("SELECT u.fullName FROM User u JOIN ConversationMember cm ON u.id = cm.userId WHERE cm.conversationId = :convId")
    List<String> findUserNamesByConversationId(@Param("convId") UUID convId);

    // ================= GET ALL CONVERSATIONS BY USER =================
    List<ConversationMember> findByUserId(UUID userId);

    // ================= GET ALL MEMBERS BY CONVERSATION =================
    // 🔥 Bổ sung hàm này để sửa lỗi trong MessageService
    List<ConversationMember> findByConversationId(UUID conversationId);

    // Thêm hàm này vào ConversationMemberRepository.java
Optional<ConversationMember> findByConversationIdAndUserId(UUID conversationId, UUID userId);

// ================= BỔ SUNG ĐỂ ĐẾM SỐ LƯỢNG THÀNH VIÊN =================
long countByConversationId(UUID conversationId);

    // ================= CHECK PRIVATE CHAT EXISTS =================
    @Query("""
        SELECT c.id
        FROM ConversationMember m1
        JOIN ConversationMember m2 ON m1.conversationId = m2.conversationId
        JOIN Conversation c ON c.id = m1.conversationId
        WHERE c.type = 'PRIVATE'
        AND m1.userId = :userA
        AND m2.userId = :userB
    """)
    Optional<UUID> findPrivateConversation(
            @Param("userA") UUID userA,
            @Param("userB") UUID userB
    );

    // ================= BỔ SUNG: TÌM KIẾM THÀNH VIÊN ĐỂ TAG (MENTION) =================
    @Query("SELECT u FROM User u " +
           "JOIN ConversationMember cm ON cm.userId = u.id " +
           "WHERE cm.conversationId = :conversationId " +
           "AND (LOWER(u.fullName) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%')))")
    static
    List<User> searchUsersInConversation(@Param("conversationId") UUID conversationId, @Param("query") String query) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'searchUsersInConversation'");
    }
}