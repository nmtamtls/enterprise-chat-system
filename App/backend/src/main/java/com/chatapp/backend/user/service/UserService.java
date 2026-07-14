// package com.chatapp.backend.user.service;

// import com.chatapp.backend.common.exception.ResourceNotFoundException;
// import com.chatapp.backend.user.dto.UpdateUserRequest;
// import com.chatapp.backend.user.dto.UserResponse;
// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;
// import org.springframework.stereotype.Service;

// import java.util.List;

// @Service
// public class UserService {

//     private final UserRepository userRepository;

//     public UserService(UserRepository userRepository) {
//         this.userRepository = userRepository;
//     }

//     // ================= GET ALL USERS =================
//     public List<UserResponse> getAll() {
//         return userRepository.findAll()
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     // ================= GET BY USERNAME =================
//     public UserResponse getByUsername(String username) {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

//         return map(user);
//     }

//     // ================= UPDATE USER =================
//     public UserResponse update(String username, UpdateUserRequest req) {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

//         // update an toàn (tránh overwrite null)
//         if (req.getFullName() != null && !req.getFullName().isBlank()) {
//             user.setFullName(req.getFullName());
//         }

//         if (req.getAvatarUrl() != null && !req.getAvatarUrl().isBlank()) {
//             user.setAvatarUrl(req.getAvatarUrl());
//         }

//         User updatedUser = userRepository.save(user);

//         return map(updatedUser);
//     }

//     // ================= MAPPER =================
//     private UserResponse map(User user) {
//         return new UserResponse(
//                 user.getId(),          // UUID (đã fix entity)
//                 user.getUsername(),
//                 user.getEmail(),
//                 user.getFullName(),
//                 user.getAvatarUrl(),
//                 user.getRole()
//         );
//     }
// }








// package com.chatapp.backend.user.service;

// import com.chatapp.backend.common.exception.ResourceNotFoundException;
// import com.chatapp.backend.user.dto.UpdateUserRequest;
// import com.chatapp.backend.user.dto.UserResponse;
// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;
// import com.chatapp.backend.contact.repository.ContactRepository; 

// import org.springframework.stereotype.Service;
// import java.util.List;
// import java.util.UUID;

// @Service
// public class UserService {

//     private final UserRepository userRepository;
//     private final ContactRepository contactRepository;

//     public UserService(UserRepository userRepository, ContactRepository contactRepository) {
//         this.userRepository = userRepository;
//         this.contactRepository = contactRepository;
//     }

//     // =========================================================================
//     // LẤY BẠN BÈ ĐỐI XỨNG
//     // =========================================================================
//     public List<UserResponse> getFriendsByUsername(String username) {
//         User currentUser = userRepository.findByUsername(username)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

//         List<UUID> friendIds = contactRepository.findAcceptedContactIdsByUserId(currentUser.getId());

//         if (friendIds == null || friendIds.isEmpty()) {
//             return List.of();
//         }

//         return userRepository.findAllById(friendIds)
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     // ================= SEARCH USERS =================
//     public List<UserResponse> searchPublicUsers(String query) {
//         if (query == null || query.isBlank()) return List.of();
        
//         return userRepository.findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(query, query)
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     // ================= DÀNH CHO ADMIN =================
//     // FIX: Đổi tên thành findAllUsers để khớp với lỗi bạn gặp ở Controller
//     public List<UserResponse> findAllUsers() {
//         return userRepository.findAll()
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     public UserResponse getByUsername(String username) {
//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
//         return map(user);
//     }

//     public UserResponse update(String username, UpdateUserRequest req) {
//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

//         if (req.getFullName() != null && !req.getFullName().isBlank()) {
//             user.setFullName(req.getFullName());
//         }
//         if (req.getAvatarUrl() != null && !req.getAvatarUrl().isBlank()) {
//             user.setAvatarUrl(req.getAvatarUrl());
//         }

//         User updatedUser = userRepository.save(user);
//         return map(updatedUser);
//     }

//     // Hàm helper chuyển đổi Entity -> DTO (Đảm bảo các field khớp với UserResponse DTO)
//     private UserResponse map(User user) {
//         return new UserResponse(
//                 user.getId(),
//                 user.getUsername(),
//                 user.getEmail(),
//                 user.getFullName(),
//                 user.getAvatarUrl(),
//                 user.getRole(),
//                 user.getStatus(),      // "ADMIN" hoặc "USER"
//                 user.getCreatedAt(),
//                 null,               // isUploadBlocked (sẽ bổ sung sau khi chỉnh sửa Repository)
//                 null                // isChatBlocked (sẽ bổ sung sau khi chỉnh sửa Repository)  
//         );
//     }
// }



// package com.chatapp.backend.user.service;

// import com.chatapp.backend.common.exception.ResourceNotFoundException;
// import com.chatapp.backend.contact.repository.ContactRepository;
// import com.chatapp.backend.user.dto.UpdateUserRequest;
// import com.chatapp.backend.user.dto.UserResponse;
// import com.chatapp.backend.user.entity.User;
// import com.chatapp.backend.user.repository.UserRepository;

// import jakarta.transaction.Transactional;

// import org.springframework.stereotype.Service;

// import java.util.List;
// import java.util.UUID;

// @Service
// public class UserService {

//     private final UserRepository userRepository;
//     private final ContactRepository contactRepository;

//     public UserService(
//             UserRepository userRepository,
//             ContactRepository contactRepository
//     ) {
//         this.userRepository = userRepository;
//         this.contactRepository = contactRepository;
//     }

//     // =========================================================================
//     // LẤY DANH SÁCH BẠN BÈ
//     // =========================================================================
//     public List<UserResponse> getFriendsByUsername(String username) {

//         User currentUser = userRepository.findByUsername(username)
//                 .orElseThrow(() ->
//                         new ResourceNotFoundException(
//                                 "User not found: " + username
//                         ));

//         List<UUID> friendIds =
//                 contactRepository.findAcceptedContactIdsByUserId(
//                         currentUser.getId()
//                 );

//         if (friendIds == null || friendIds.isEmpty()) {
//             return List.of();
//         }

//         return userRepository.findAllById(friendIds)
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     // =========================================================================
//     // SEARCH USER
//     // =========================================================================
//     public List<UserResponse> searchPublicUsers(String query) {

//         if (query == null || query.isBlank()) {
//             return List.of();
//         }

//         return userRepository
//                 .findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(
//                         query,
//                         query
//                 )
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     // =========================================================================
//     // ADMIN - GET ALL USERS
//     // =========================================================================
//     public List<UserResponse> findAllUsers() {

//         return userRepository.findAll()
//                 .stream()
//                 .map(this::map)
//                 .toList();
//     }

//     // =========================================================================
//     // GET USER BY USERNAME
//     // =========================================================================
//     public UserResponse getByUsername(String username) {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() ->
//                         new ResourceNotFoundException(
//                                 "User not found: " + username
//                         ));

//         return map(user);
//     }

//     // =========================================================================
//     // GET CURRENT USER
//     // =========================================================================
//     public UserResponse getCurrentUser(String username) {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() ->
//                         new ResourceNotFoundException(
//                                 "User not found: " + username
//                         ));

//         return map(user);
//     }

//     // =========================================================================
//     // UPDATE PROFILE
//     // =========================================================================
//     @Transactional
//     public UserResponse update(
//             String username,
//             UpdateUserRequest req
//     ) {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() ->
//                         new ResourceNotFoundException(
//                                 "User not found: " + username
//                         ));

//         // ================= UPDATE FULL NAME =================
//         if (req.getFullName() != null &&
//                 !req.getFullName().isBlank()) {

//             user.setFullName(req.getFullName().trim());
//         }

//         // ================= UPDATE AVATAR =================
//         if (req.getAvatarUrl() != null &&
//                 !req.getAvatarUrl().isBlank()) {

//             user.setAvatarUrl(req.getAvatarUrl().trim());
//         }

//         User updatedUser = userRepository.save(user);

//         return map(updatedUser);
//     }

//     // =========================================================================
//     // UPDATE ONLY AVATAR
//     // =========================================================================
//     @Transactional
//     public UserResponse updateAvatar(
//             String username,
//             String avatarUrl
//     ) {

//         User user = userRepository.findByUsername(username)
//                 .orElseThrow(() ->
//                         new ResourceNotFoundException(
//                                 "User not found: " + username
//                         ));

//         user.setAvatarUrl(avatarUrl);

//         User updatedUser = userRepository.save(user);

//         return map(updatedUser);
//     }

//     // =========================================================================
//     // ENTITY -> DTO
//     // =========================================================================
//     private UserResponse map(User user) {

//         return new UserResponse(
//                 user.getId(),
//                 user.getUsername(),
//                 user.getEmail(),
//                 user.getFullName(),
//                 user.getAvatarUrl(),
//                 user.getRole(),
//                 user.getStatus(),
//                 user.getCreatedAt(),

//                 // ADMIN BLOCK FEATURE
//                 null,
//                 null
//         );
//     }
// }





package com.chatapp.backend.user.service;

import com.chatapp.backend.common.exception.ResourceNotFoundException;
import com.chatapp.backend.contact.repository.ContactRepository;
import com.chatapp.backend.user.dto.UpdateUserRequest;
import com.chatapp.backend.user.dto.UserResponse;
import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;

import jakarta.transaction.Transactional;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ContactRepository contactRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public UserService(
            UserRepository userRepository,
            ContactRepository contactRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.userRepository = userRepository;
        this.contactRepository = contactRepository;
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================================
    // LẤY DANH SÁCH BẠN BÈ
    // =========================================================================
    public List<UserResponse> getFriendsByUsername(String username) {

        User currentUser = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        ));

        List<UUID> friendIds =
                contactRepository.findAcceptedContactIdsByUserId(
                        currentUser.getId()
                );

        if (friendIds == null || friendIds.isEmpty()) {
            return List.of();
        }

        return userRepository.findAllById(friendIds)
                .stream()
                .map(this::map)
                .toList();
    }

    // =========================================================================
    // SEARCH USER
    // =========================================================================
    public List<UserResponse> searchPublicUsers(String query) {

        if (query == null || query.isBlank()) {
            return List.of();
        }

        return userRepository
                .findByFullNameContainingIgnoreCaseOrUsernameContainingIgnoreCase(
                        query,
                        query
                )
                .stream()
                .map(this::map)
                .toList();
    }

    // =========================================================================
    // ADMIN - GET ALL USERS
    // =========================================================================
    public List<UserResponse> findAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    // =========================================================================
    // GET USER BY USERNAME
    // =========================================================================
    public UserResponse getByUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        ));

        return map(user);
    }

    // =========================================================================
    // GET CURRENT USER
    // =========================================================================
    public UserResponse getCurrentUser(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        ));

        return map(user);
    }

    // =========================================================================
    // UPDATE PROFILE
    // =========================================================================
    @Transactional
    public UserResponse update(
            String username,
            UpdateUserRequest req
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        ));

        // ================= UPDATE FULL NAME =================
        if (req.getFullName() != null &&
                !req.getFullName().isBlank()) {

            user.setFullName(req.getFullName().trim());
        }

        // ================= UPDATE AVATAR =================
        if (req.getAvatarUrl() != null &&
                !req.getAvatarUrl().isBlank()) {

            user.setAvatarUrl(req.getAvatarUrl().trim());
        }

        User updatedUser = userRepository.save(user);

        // =====================================================
        // REALTIME PROFILE UPDATE
        // =====================================================

        messagingTemplate.convertAndSend(
                "/topic/profile-updates",
                map(updatedUser)
        );

        return map(updatedUser);
    }

    // =========================================================================
    // UPDATE ONLY AVATAR
    // =========================================================================
    @Transactional
    public UserResponse updateAvatar(
            String username,
            String avatarUrl
    ) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found: " + username
                        ));

        user.setAvatarUrl(avatarUrl);

        User updatedUser = userRepository.save(user);

        // =====================================================
        // REALTIME PROFILE UPDATE
        // =====================================================

        messagingTemplate.convertAndSend(
                "/topic/profile-updates",
                map(updatedUser)
        );

        return map(updatedUser);
    }

    // =========================================================================
    // ENTITY -> DTO
    // =========================================================================
    private UserResponse map(User user) {

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt(),

                // ADMIN BLOCK FEATURE
                null,
                null
        );
    }
}

