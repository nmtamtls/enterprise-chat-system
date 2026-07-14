package com.chatapp.backend.common.exception;

import com.chatapp.backend.common.response.ApiResponse;

import java.nio.file.AccessDeniedException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

// @RestControllerAdvice
// public class GlobalExceptionHandler {

//     @ExceptionHandler(ResourceNotFoundException.class)
//     public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
//         return ResponseEntity.status(HttpStatus.NOT_FOUND)
//                 .body(new ApiResponse<>(false, ex.getMessage(), null));
//     }

//     @ExceptionHandler(Exception.class)
//     public ResponseEntity<ApiResponse<?>> handleOther(Exception ex) {
//         return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
//                 .body(new ApiResponse<>(false, "Server error: " + ex.getMessage(), null));
//     }
// }

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Lỗi không tìm thấy tài nguyên (đã rõ ràng)
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<?>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiResponse<>(false, ex.getMessage(), null));
    }

    // Lỗi vi phạm quyền truy cập (Dùng cho vụ bảo mật File ở trên)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse<>(false, "Bạn không có quyền thực hiện hành động này", null));
    }

    // Lỗi validation dữ liệu từ client
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldError().getDefaultMessage();
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse<>(false, message, null));
    }

    // Lỗi hệ thống chung (Bảo mật: KHÔNG trả về ex.getMessage() chi tiết)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleOther(Exception ex) {
        // Log lỗi vào file log hệ thống để mình (developer) xem, chứ không trả về client
        // logger.error("Internal Server Error: ", ex); 
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(false, "Đã có lỗi hệ thống xảy ra, vui lòng thử lại sau", null));
    }
}