

package com.chatapp.backend.common.response;

public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

    // Constructor mặc định
    public ApiResponse() {}

    // Constructor đầy đủ
    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // Constructor bổ sung cho trường hợp không có data
    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
        this.data = null;
    }

    // --- STATIC FACTORY METHODS (Dùng để khởi tạo nhanh) ---

    // Dùng cho trường hợp thành công có kèm dữ liệu
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    // Dùng cho trường hợp thành công không kèm dữ liệu (ví dụ: DELETE thành công)
    public static <T> ApiResponse<T> success(String message) {
        return new ApiResponse<>(true, message, null);
    }

    // Dùng cho trường hợp lỗi
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null);
    }

    // --- GETTERS & SETTERS ---

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public T getData() { return data; }
    public void setData(T data) { this.data = data; }
}