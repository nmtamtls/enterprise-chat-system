package com.chatapp.backend.user.repository;

import com.chatapp.backend.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    List<User> findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(String fullName, String username);

    // --- CÁC PHƯƠNG THỨC BỔ SUNG CHO ADMIN ---

    // 1. Lấy danh sách user theo trạng thái (vd: chỉ lấy những người 'active')
    List<User> findByStatus(String status);

    // 2. Đếm số lượng user theo vai trò (để thống kê trên Admin Dashboard)
    long countByRole(String role);
    
    // 3. Tìm user theo email (thường cần để kiểm tra trước khi xóa hoặc thao tác)
    Optional<User> findByEmail(String email);
}