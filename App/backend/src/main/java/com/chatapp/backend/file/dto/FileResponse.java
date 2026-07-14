// package com.chatapp.backend.file.dto;

// public class FileResponse {
//     private String fileName;
//     private String url;
//     private String contentType;
//     private long size;

//     public FileResponse() {}

//     public FileResponse(String fileName, String url, String contentType, long size) {
//         this.fileName = fileName;
//         this.url = url;
//         this.contentType = contentType;
//         this.size = size;
//     }

//     public String getFileName() {
//         return fileName;
//     }

//     public void setFileName(String fileName) {
//         this.fileName = fileName;
//     }

//     public String getUrl() {
//         return url;
//     }

//     public void setUrl(String url) {
//         this.url = url;
//     }

//     public String getContentType() {
//         return contentType;
//     }

//     public void setContentType(String contentType) {
//         this.contentType = contentType;
//     }

//     public long getSize() {
//         return size;
//     }

//     public void setSize(long size) {
//         this.size = size;
//     }

//     public static Object builder() {
//      // TODO Auto-generated method stub
//      throw new UnsupportedOperationException("Unimplemented method 'builder'");
//     }
// }





package com.chatapp.backend.file.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data                // Tự động tạo Getter, Setter, toString, equals, hashCode
@Builder             // Tạo mẫu thiết kế Builder để khởi tạo object chuyên nghiệp hơn
@NoArgsConstructor   // Tạo Constructor không tham số
@AllArgsConstructor  // Tạo Constructor đầy đủ tham số (4 tham số của bạn)
public class FileResponse {
    private UUID id;
    private String fileName;
    private String uploaderName;
    private String fileUrl;
    private String fileType;
    private long fileSize;
    private LocalDateTime createdAt;
}



// package com.chatapp.backend.file.dto;

// public class FileResponse {

//     private String fileName;
//     private String url;
//     private String contentType;
//     private long size;

//     // ===== CONSTRUCTOR =====
//     public FileResponse() {}

//     public FileResponse(String fileName, String url, String contentType, long size) {
//         this.fileName = fileName;
//         this.url = url;
//         this.contentType = contentType;
//         this.size = size;
//     }

//     // ===== GETTER / SETTER =====
//     public String getFileName() {
//         return fileName;
//     }

//     public void setFileName(String fileName) {
//         this.fileName = fileName;
//     }

//     public String getUrl() {
//         return url;
//     }

//     public void setUrl(String url) {
//         this.url = url;
//     }

//     public String getContentType() {
//         return contentType;
//     }

//     public void setContentType(String contentType) {
//         this.contentType = contentType;
//     }

//     public long getSize() {
//         return size;
//     }

//     public void setSize(long size) {
//         this.size = size;
//     }
// }