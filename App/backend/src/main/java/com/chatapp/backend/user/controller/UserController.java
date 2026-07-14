package com.chatapp.backend.user.controller;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.file.dto.FileResponse;
import com.chatapp.backend.file.service.FileService;
import com.chatapp.backend.security.jwt.JwtUtil;
import com.chatapp.backend.user.dto.UpdateUserRequest;
import com.chatapp.backend.user.dto.UserResponse;
import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;
import com.chatapp.backend.user.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final SimpMessagingTemplate messagingTemplate;
    public UserController(
            UserService userService,
            JwtUtil jwtUtil,
            UserRepository userRepository,
            FileService fileService,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
        this.fileService = fileService;
        this.messagingTemplate = messagingTemplate;
    }

    // =========================================================================
    // LẤY DANH SÁCH BẠN BÈ
    // =========================================================================
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getMyFriends(
            HttpServletRequest request
    ) {

        String username = getUsernameFromToken(request);

        if (username == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Unauthorized", null));
        }

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Get friends success",
                        userService.getFriendsByUsername(username)
                )
        );
    }

    // =========================================================================
    // TÌM KIẾM USER
    // =========================================================================
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam String query
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Search success",
                        userService.searchPublicUsers(query)
                )
        );
    }

    // =========================================================================
    // LẤY USER THEO USERNAME
    // =========================================================================
    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(
            @PathVariable String username
    ) {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        userService.getByUsername(username)
                )
        );
    }

    // Thêm phương thức helper này vào UserController
private void broadcastProfileUpdate(UserResponse updatedUser) {
    // Wrap dữ liệu theo đúng cấu trúc Frontend mong đợi
    Map<String, Object> payload = new HashMap<>();
    payload.put("type", "PROFILE_UPDATED");
    payload.put("data", updatedUser);
    
    // Gửi đến topic mà Frontend đang lắng nghe
    messagingTemplate.convertAndSend("/topic/profile-updates", payload);
}

    // =========================================================================
    // UPDATE USER THEO USERNAME
    // =========================================================================
    @PutMapping("/{username}")
public ResponseEntity<ApiResponse<UserResponse>> update(
        @PathVariable String username,
        @RequestBody UpdateUserRequest req
) {
    UserResponse updatedUser = userService.update(username, req);
    broadcastProfileUpdate(updatedUser); 
    return ResponseEntity.ok(new ApiResponse<>(true, "Updated", updatedUser));
}
    // =========================================================================
    // UPDATE PROFILE CHÍNH MÌNH
    // =========================================================================
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateMyProfile(
            HttpServletRequest request,
            @RequestBody UpdateUserRequest req
    ) {

        String username = getUsernameFromToken(request);

        if (username == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Unauthorized", null));
        }

        UserResponse updatedUser = userService.update(username, req);
        broadcastProfileUpdate(updatedUser);
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Profile updated successfully",
                        updatedUser
                )
        );
    }



    // =========================================================================
    // UPLOAD AVATAR
    // =========================================================================
@PostMapping("/avatar")
public ResponseEntity<ApiResponse<UserResponse>> uploadAvatar(
        HttpServletRequest request,
        @RequestParam("file") MultipartFile file
) {

    String username = getUsernameFromToken(request);

    if (username == null) {
        return ResponseEntity.status(401)
                .body(new ApiResponse<>(
                        false,
                        "Unauthorized",
                        null
                ));
    }

    try {

        // =========================================================
        // 1. Upload file
        // =========================================================
        FileResponse uploadedFile =
                fileService.uploadFile(file);

        // =========================================================
        // 2. Update avatar user
        // =========================================================
        UserResponse updatedUser =
                userService.updateAvatar(
                        username,
                        uploadedFile.getFileUrl()
                );

        // =========================================================
        // 3. REALTIME SOCKET UPDATE
        // =========================================================
        // messagingTemplate.convertAndSend(
        //         "/topic/user-avatar",
        //         updatedUser
        // );
        broadcastProfileUpdate(updatedUser);

        // =========================================================
        // 4. RESPONSE
        // =========================================================
        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Avatar updated successfully",
                        updatedUser
                )
        );

    } catch (Exception e) {

        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(
                        false,
                        "Upload avatar failed: " + e.getMessage(),
                        null
                ));
    }
}

    // =========================================================================
    // LẤY CURRENT USER
    // =========================================================================
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            HttpServletRequest request
    ) {

        String username = getUsernameFromToken(request);

        if (username == null) {
            return ResponseEntity.status(401)
                    .body(new ApiResponse<>(false, "Missing token", null));
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        UserResponse response =
                userService.getByUsername(user.getUsername());

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "OK",
                        response
                )
        );
    }

    // =========================================================================
    // ADMIN - GET ALL USERS
    // =========================================================================
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {

        return ResponseEntity.ok(
                new ApiResponse<>(
                        true,
                        "Lấy tất cả user thành công",
                        userService.findAllUsers()
                )
        );
    }

    // =========================================================================
    // HELPER - GET USERNAME FROM JWT
    // =========================================================================
    private String getUsernameFromToken(HttpServletRequest request) {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null ||
                !authHeader.startsWith("Bearer ")) {
            return null;
        }

        try {

            String token = authHeader.substring(7);

            return jwtUtil.extractUsername(token);

        } catch (Exception e) {

            return null;
        }
    }
}

