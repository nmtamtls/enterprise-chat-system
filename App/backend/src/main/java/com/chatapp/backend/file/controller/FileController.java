package com.chatapp.backend.file.controller;

import com.chatapp.backend.common.response.ApiResponse;
import com.chatapp.backend.file.dto.FileResponse;
import com.chatapp.backend.file.service.FileService;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.net.URLConnection;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final FileService fileService;
    private final MinioClient minioClient;

    @Value("${minio.bucket}")
    private String bucket;

    // Inject cả FileService và MinioClient vào constructor
    public FileController(FileService fileService, MinioClient minioClient) {
        this.fileService = fileService;
        this.minioClient = minioClient;
    }

    /**
     * Kiểm tra trạng thái dịch vụ file
     */
    @GetMapping("/status")
    public ResponseEntity<String> checkStatus() {
        return ResponseEntity.ok("File Service is Up and Running!");
    }

    /**
     * Upload file lên hệ thống
     */
    @PostMapping("/upload")
    public ResponseEntity<FileResponse> upload(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(fileService.uploadFile(file));
    }

    /**
     * Lấy danh sách tất cả file (Dành cho Admin)
     */
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<FileResponse>>> getAllFiles() {
        return ResponseEntity.ok(
            new ApiResponse<>(true, "Lấy tất cả file thành công", fileService.findAllFiles())
        );
    }

    /**
     * Lấy file để hiển thị hoặc xem trước (Preview)
     * Trình duyệt sẽ mở trực tiếp nếu là ảnh, PDF, video...
     */
    @GetMapping("/{fileName}")
    public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
        try {
            // 1. Lấy thông tin metadata của object từ MinIO
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder().bucket(bucket).object(fileName).build()
            );

            // 2. Lấy luồng dữ liệu (Stream) từ MinIO
            InputStream stream = minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(fileName).build()
            );

            Resource resource = new InputStreamResource(stream);

            // 3. Xác định Content-Type động
            String contentType = stat.contentType();
            if (contentType == null || contentType.equals("application/octet-stream")) {
                contentType = URLConnection.guessContentTypeFromName(fileName);
            }

            // Bổ sung nhận diện thủ công nếu cần
            if (contentType == null) {
                if (fileName.toLowerCase().endsWith(".pdf")) contentType = "application/pdf";
                else if (fileName.toLowerCase().endsWith(".txt")) contentType = "text/plain";
                else contentType = "application/octet-stream";
            }

            // 4. Trả về file với chế độ "inline" để xem trực tiếp
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

@DeleteMapping("/{id}")
public ResponseEntity<ApiResponse<Object>> deleteFile(@PathVariable UUID id) {
    fileService.deleteFile(id);
    // Sử dụng static method vừa tạo
    return ResponseEntity.ok(ApiResponse.success("Xóa file thành công"));
}
}


// package com.chatapp.backend.file.controller;

// import com.chatapp.backend.file.dto.FileResponse;
// import com.chatapp.backend.file.service.FileService;
// import io.minio.GetObjectArgs;
// import io.minio.MinioClient;
// import io.minio.StatObjectArgs;
// import io.minio.StatObjectResponse;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.core.io.InputStreamResource;
// import org.springframework.core.io.Resource;
// import org.springframework.http.HttpHeaders;
// import org.springframework.http.MediaType;
// import org.springframework.http.ResponseEntity;
// import org.springframework.web.bind.annotation.*;
// import org.springframework.web.multipart.MultipartFile;

// import java.io.InputStream;
// import java.net.URLConnection;

// @RestController
// @RequestMapping("/api/files")
// public class FileController {

//     private final FileService fileService;
//     private final MinioClient minioClient;

//     @Value("${minio.bucket}")
//     private String bucket;

//     public FileController(FileService fileService, MinioClient minioClient) {
//         this.fileService = fileService;
//         this.minioClient = minioClient;
//     }

//     /**
//      * Kiểm tra trạng thái dịch vụ file
//      */
//     @GetMapping("/status")
//     public ResponseEntity<String> checkStatus() {
//         return ResponseEntity.ok("File Service is Up and Running!");
//     }

//     /**
//      * Upload file lên hệ thống
//      */
//     @PostMapping("/upload")
//     public ResponseEntity<FileResponse> upload(@RequestParam("file") MultipartFile file) {
//         return ResponseEntity.ok(fileService.uploadFile(file));
//     }

//     /**
//      * Lấy file để hiển thị hoặc xem trước (Preview)
//      * Ưu tiên "inline" để trình duyệt mở nội dung thay vì tự động tải về ngay lập tức.
//      */
//     @GetMapping("/{fileName}")
//     public ResponseEntity<Resource> getFile(@PathVariable String fileName) {
//         try {
//             // 1. Lấy thông tin metadata của object từ MinIO
//             StatObjectResponse stat = minioClient.statObject(
//                     StatObjectArgs.builder().bucket(bucket).object(fileName).build()
//             );

//             // 2. Lấy luồng dữ liệu (Stream) từ MinIO
//             InputStream stream = minioClient.getObject(
//                     GetObjectArgs.builder().bucket(bucket).object(fileName).build()
//             );

//             Resource resource = new InputStreamResource(stream);

//             // 3. Xác định Content-Type động để trình duyệt biết cách xử lý
//             String contentType = stat.contentType();
//             if (contentType == null || contentType.equals("application/octet-stream")) {
//                 // Thử đoán lại dựa trên tên file nếu metadata không có
//                 contentType = URLConnection.guessContentTypeFromName(fileName);
//             }
            
//             // Bổ sung nhận diện thủ công cho các định dạng phổ biến nếu vẫn chưa nhận diện được
//             if (contentType == null) {
//                 if (fileName.endsWith(".pdf")) contentType = "application/pdf";
//                 else if (fileName.endsWith(".txt")) contentType = "text/plain";
//                 else contentType = "application/octet-stream";
//             }

//             // 4. Thiết lập Content-Disposition là "inline" để ƯU TIÊN XEM TRƯỚC
//             // Trình duyệt sẽ mở tab mới để xem nếu nó hỗ trợ định dạng đó (Ảnh, PDF, Text, Video)
//             // Nếu không hỗ trợ (như .zip, .docx), nó sẽ tự động chuyển sang tải về.
//             String disposition = "inline";

//             return ResponseEntity.ok()
//                     .contentType(MediaType.parseMediaType(contentType))
//                     .header(HttpHeaders.CONTENT_DISPOSITION, disposition + "; filename=\"" + fileName + "\"")
//                     // Cho phép máy tính bảng hoặc các domain khác truy cập qua tunnel
//                     .header(HttpHeaders.ACCESS_CONTROL_EXPOSE_HEADERS, HttpHeaders.CONTENT_DISPOSITION)
//                     .body(resource);

//         } catch (Exception e) {
//             return ResponseEntity.notFound().build();
//         }
//     }
// }