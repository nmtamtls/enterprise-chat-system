package com.chatapp.backend.message.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.chatapp.backend.message.entity.MessageFile;

@Repository
public interface MessageFileRepository extends JpaRepository<MessageFile, UUID> {

    // lấy tất cả file của 1 message
    List<MessageFile> findAllByMessageId(UUID messageId);
    // Thêm dòng này vào interface
    boolean existsByMessageIdAndFileId(UUID messageId, UUID fileId);
}