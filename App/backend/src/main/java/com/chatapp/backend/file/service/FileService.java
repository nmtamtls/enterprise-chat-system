// package com.chatapp.backend.file.service;

// import io.minio.*;
// import jakarta.annotation.PostConstruct;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;
// import com.chatapp.backend.file.dto.FileResponse;

// import java.util.UUID;

// @Slf4j // Sử dụng log để debug tốt hơn
// @Service
// public class FileService {

//     private final MinioClient minioClient;

//     @Value("${minio.bucket}")
//     private String bucket;

//     @Value("${minio.url}")
//     private String minioUrl;

//     public FileService(MinioClient minioClient) {
//         this.minioClient = minioClient;
//     }

//     @PostConstruct
//     public void initBucket() {
//         try {
//             boolean found = minioClient.bucketExists(
//                     BucketExistsArgs.builder().bucket(bucket).build()
//             );

//             if (!found) {
//                 minioClient.makeBucket(
//                         MakeBucketArgs.builder().bucket(bucket).build()
//                 );
//                 log.info("Bucket '{}' created successfully.", bucket);
//             }
//         } catch (Exception e) {
//             log.error("Init bucket failed: {}", e.getMessage());
//             throw new RuntimeException("Init bucket failed", e);
//         }
//     }

//     public FileResponse uploadFile(MultipartFile file) {
//         try {
//             // 1. Validate
//             if (file.isEmpty()) {
//                 throw new RuntimeException("File is empty");
//             }

//             // Giới hạn 10MB (Khớp với frontend đã chặn)
//             if (file.getSize() > 10 * 1024 * 1024) {
//                 throw new RuntimeException("File size exceeds 10MB");
//             }

//             // 2. Làm sạch tên file (Xóa khoảng trắng để tránh lỗi URL)
//             String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
//             String cleanFileName = originalName.replaceAll("\\s+", "_"); 
//             String fileName = UUID.randomUUID() + "_" + cleanFileName;

//             // 3. Upload lên MinIO
//             minioClient.putObject(
//                     PutObjectArgs.builder()
//                             .bucket(bucket)
//                             .object(fileName)
//                             .stream(file.getInputStream(), file.getSize(), -1)
//                             .contentType(file.getContentType())
//                             .build()
//             );

//             // 4. Xử lý URL (Đảm bảo không bị trùng dấu /)
//             String baseUrl = minioUrl.endsWith("/") ? minioUrl.substring(0, minioUrl.length() - 1) : minioUrl;
//             String url = String.format("%s/%s/%s", baseUrl, bucket, fileName);

//             log.info("Uploaded file: {} successfully. URL: {}", fileName, url);

//             // Trả về DTO
//             return new FileResponse(
//                     originalName, // Trả về tên gốc để frontend hiển thị 📄
//                     url,
//                     file.getContentType(),
//                     file.getSize()
//             );

//         } catch (Exception e) {
//             log.error("Upload error: {}", e.getMessage());
//             throw new RuntimeException("Upload file failed: " + e.getMessage());
//         }
//     }
// }





// package com.chatapp.backend.file.service;

// import io.minio.*;
// import jakarta.annotation.PostConstruct;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;
// import com.chatapp.backend.file.dto.FileResponse;
// import com.chatapp.backend.file.entity.File;
// import com.chatapp.backend.file.repository.FileRepository;

// import java.util.List;
// import java.util.UUID;
// import java.util.stream.Collectors;

// @Slf4j
// @Service
// public class FileService {

//     private final MinioClient minioClient;
//     private final FileRepository fileRepository;

//     @Value("${minio.bucket}")
//     private String bucket;

//     @Value("${minio.url}")
//     private String minioUrl;

//     public FileService(MinioClient minioClient, FileRepository fileRepository) {
//         this.minioClient = minioClient;
//         this.fileRepository = fileRepository;
//     }

//     /**
//      * Tự động kiểm tra và tạo Bucket trên MinIO khi ứng dụng khởi chạy
//      */
//     @PostConstruct
//     public void initBucket() {
//         try {
//             boolean found = minioClient.bucketExists(
//                     BucketExistsArgs.builder().bucket(bucket).build()
//             );

//             if (!found) {
//                 minioClient.makeBucket(
//                         MakeBucketArgs.builder().bucket(bucket).build()
//                 );
//                 log.info("Bucket '{}' created successfully.", bucket);
//             }
//         } catch (Exception e) {
//             log.error("Init bucket failed: {}", e.getMessage());
//             throw new RuntimeException("Init bucket failed", e);
//         }
//     }

//     /**
//      * Lấy danh sách tất cả file từ Database (Dùng cho Admin)
//      */
//     public List<FileResponse> findAllFiles() {
//         return fileRepository.findAll().stream()
//                 .map(file -> new FileResponse(
//                         file.getFileName(),
//                         file.getFileUrl(),
//                         file.getFileType(),
//                         file.getFileSize(),
//                         file.getCreatedAt()
//                 ))
//                 .collect(Collectors.toList());
//     }

//     /**
//      * Xử lý tải file lên: Lưu vào MinIO và ghi nhận vào Database
//      */
//     public FileResponse uploadFile(MultipartFile file) {
//         try {
//             // 1. Kiểm tra file trống
//             if (file.isEmpty()) {
//                 throw new RuntimeException("File is empty");
//             }

//             // 2. Kiểm tra dung lượng (10MB)
//             if (file.getSize() > 10 * 1024 * 1024) {
//                 throw new RuntimeException("File size exceeds 10MB");
//             }

//             // 3. Xử lý tên file để tránh trùng lặp và lỗi URL
//             String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown";
//             String cleanFileName = originalName.replaceAll("\\s+", "_"); 
//             String uniqueFileName = UUID.randomUUID() + "_" + cleanFileName;

//             // 4. Upload dữ liệu lên MinIO
//             minioClient.putObject(
//                     PutObjectArgs.builder()
//                             .bucket(bucket)
//                             .object(uniqueFileName)
//                             .stream(file.getInputStream(), file.getSize(), -1)
//                             .contentType(file.getContentType())
//                             .build()
//             );

//             // 5. Tạo URL truy cập file
//             String baseUrl = minioUrl.endsWith("/") ? minioUrl.substring(0, minioUrl.length() - 1) : minioUrl;
//             String fileUrl = String.format("%s/%s/%s", baseUrl, bucket, uniqueFileName);

//             // 6. Lưu thông tin Metadata vào Database (MySQL/PostgreSQL)
//             File fileEntity = new File();
//             fileEntity.setId(UUID.randomUUID());
//             fileEntity.setFileName(originalName); // Lưu tên gốc để hiển thị
//             fileEntity.setFileUrl(fileUrl);
//             fileEntity.setFileType(file.getContentType());
//             fileEntity.setFileSize(file.getSize());
//             // fileEntity.setUploaderId(currentUserId); // Gán ID người upload nếu cần

//             fileRepository.save(fileEntity);

//             log.info("File uploaded and saved to DB: {} | URL: {}", uniqueFileName, fileUrl);

//             // 7. Trả về kết quả cho Client
//             return new FileResponse(
//                     originalName,
//                     fileUrl,
//                     file.getContentType(),
//                     file.getSize(),
//                     fileEntity.getCreatedAt()
//             );

//         } catch (Exception e) {
//             log.error("Upload error: {}", e.getMessage());
//             throw new RuntimeException("Upload file failed: " + e.getMessage());
//         }
//     }
// }







package com.chatapp.backend.file.service;

import io.minio.*;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.chatapp.backend.file.dto.FileResponse;
import com.chatapp.backend.file.entity.File;
import com.chatapp.backend.file.repository.FileRepository;
import com.chatapp.backend.user.entity.User;
import com.chatapp.backend.user.repository.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FileService {

    private final MinioClient minioClient;
    private final FileRepository fileRepository;
    private final UserRepository userRepository;

    @Value("${minio.bucket}")
    private String bucket;

    @Value("${minio.url}")
    private String minioUrl;

    public FileService(
            MinioClient minioClient,
            FileRepository fileRepository,
            UserRepository userRepository
    ) {
        this.minioClient = minioClient;
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }

    /**
     * Tự động kiểm tra và tạo Bucket trên MinIO khi ứng dụng khởi chạy
     */
    @PostConstruct
    public void initBucket() {
        try {
            boolean found = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucket).build()
            );

            if (!found) {
                minioClient.makeBucket(
                        MakeBucketArgs.builder().bucket(bucket).build()
                );
                log.info("Bucket '{}' created successfully.", bucket);
            }
        } catch (Exception e) {
            log.error("Init bucket failed: {}", e.getMessage());
            throw new RuntimeException("Init bucket failed", e);
        }
    }

    /**
     * Lấy danh sách tất cả file từ Database (Dùng cho Admin)
     */
    public List<FileResponse> findAllFiles() {
        return fileRepository.findAll().stream()
                .map(file -> {

                    String uploaderName = null;

                    // if (file.getUploaderId() != null) {
                    //     uploaderName = userRepository.findById(file.getUploaderId())
                    //             .map(User::getUsername)
                    //             .orElse(null);
                    // }

                    if (file.getUploaderId() != null) {
    uploaderName = userRepository.findById(file.getUploaderId())
            .map(user -> user.getUsername())
            .orElse(null);
}

                    return FileResponse.builder()
                            .id(file.getId())
                            .fileName(file.getFileName())
                            .fileUrl(file.getFileUrl())
                            .fileType(file.getFileType())
                            .fileSize(file.getFileSize())
                            .createdAt(file.getCreatedAt())
                            .uploaderName(uploaderName)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Xử lý tải file lên: Lưu vào MinIO và ghi nhận vào Database
     */
    public FileResponse uploadFile(MultipartFile file) {
        try {

            // 1. Kiểm tra file trống
            if (file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }

            // 2. Kiểm tra dung lượng (10MB)
            if (file.getSize() > 10 * 1024 * 1024) {
                throw new RuntimeException("File size exceeds 10MB");
            }

            // 3. Lấy user hiện tại từ JWT/Spring Security
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();

            String username = authentication.getName();

            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // 4. Xử lý tên file
            String originalName = file.getOriginalFilename() != null
                    ? file.getOriginalFilename()
                    : "unknown";

        //     String cleanFileName =
        //             originalName.replaceAll("\\s+", "_");

        //     String uniqueFileName =
        //             UUID.randomUUID() + "_" + cleanFileName;

            String uniqueFileName =
                       UUID.randomUUID() + ".enc";

            // 5. Upload lên MinIO
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(uniqueFileName)
                            .stream(file.getInputStream(), file.getSize(), -1)
                        //     .contentType(file.getContentType())
                            .contentType("application/octet-stream")
                            .build()
            );

            // 6. Tạo URL
            String baseUrl = minioUrl.endsWith("/")
                    ? minioUrl.substring(0, minioUrl.length() - 1)
                    : minioUrl;

            String fileUrl = String.format(
                    "%s/%s/%s",
                    baseUrl,
                    bucket,
                    uniqueFileName
            );

            // 7. Lưu DB
            File fileEntity = new File();

            fileEntity.setId(UUID.randomUUID());
            fileEntity.setUploaderId(currentUser.getId());
            fileEntity.setFileName(originalName);
            fileEntity.setFileUrl(fileUrl);
            fileEntity.setFileType(file.getContentType());
            fileEntity.setFileSize(file.getSize());

            fileRepository.save(fileEntity);

            log.info(
                    "File uploaded and saved to DB: {} | URL: {}",
                    uniqueFileName,
                    fileUrl
            );

            // 8. Response
            return FileResponse.builder()
                    .fileName(originalName)
                    .fileUrl(fileUrl)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .createdAt(fileEntity.getCreatedAt())
                    .uploaderName(currentUser.getUsername())
                    .build();

        } catch (Exception e) {
            log.error("Upload error: {}", e.getMessage());
            throw new RuntimeException(
                    "Upload file failed: " + e.getMessage()
            );
        }
    }

    public void deleteFile(UUID fileId) {
    // 1. Tìm thông tin file trong DB
    File fileEntity = fileRepository.findById(fileId)
            .orElseThrow(() -> new RuntimeException("File không tồn tại"));

    // 2. Trích xuất tên file từ URL (File URL của bạn dạng: baseUrl/bucket/uniqueFileName)
    // Cách đơn giản nhất là lấy phần sau cùng của URL
    String fileUrl = fileEntity.getFileUrl();
    String fileName = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

    try {
        // 3. Xóa trên MinIO
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucket)
                        .object(fileName)
                        .build()
        );

        // 4. Xóa trong DB
        fileRepository.delete(fileEntity);
        log.info("File deleted successfully: {}", fileName);
    } catch (Exception e) {
        log.error("Error deleting file from MinIO/DB: {}", e.getMessage());
        throw new RuntimeException("Xóa file thất bại: " + e.getMessage());
    }
}
}












// package com.chatapp.backend.file.service;

// import io.minio.*;
// import jakarta.annotation.PostConstruct;
// import lombok.extern.slf4j.Slf4j;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;
// import com.chatapp.backend.file.dto.FileResponse;

// import java.util.UUID;

// @Slf4j
// @Service
// public class FileService {

//     private final MinioClient minioClient;

//     @Value("${minio.bucket}")
//     private String bucket;

//     // URL nội bộ (localhost)
//     @Value("${minio.url}")
//     private String minioUrl;

//     // URL public (Dev Tunnel / domain)
//     @Value("${app.public-url}")
//     private String publicUrl;

//     public FileService(MinioClient minioClient) {
//         this.minioClient = minioClient;
//     }

//     // ================= INIT BUCKET =================
//     @PostConstruct
//     public void initBucket() {
//         try {
//             boolean found = minioClient.bucketExists(
//                     BucketExistsArgs.builder().bucket(bucket).build()
//             );

//             if (!found) {
//                 minioClient.makeBucket(
//                         MakeBucketArgs.builder().bucket(bucket).build()
//                 );
//                 log.info("Bucket '{}' created successfully.", bucket);
//             }

//         } catch (Exception e) {
//             log.error("Init bucket failed: {}", e.getMessage());
//             throw new RuntimeException("Init bucket failed", e);
//         }
//     }

//     // ================= UPLOAD FILE =================
//     public FileResponse uploadFile(MultipartFile file) {

//         try {
//             // ===== VALIDATE =====
//             if (file.isEmpty()) {
//                 throw new RuntimeException("File is empty");
//             }

//             if (file.getSize() > 10 * 1024 * 1024) {
//                 throw new RuntimeException("File size exceeds 10MB");
//             }

//             // ===== CLEAN FILE NAME =====
//             String originalName = file.getOriginalFilename() != null
//                     ? file.getOriginalFilename()
//                     : "unknown";

//             String cleanFileName = originalName.replaceAll("\\s+", "_");
//             String fileName = UUID.randomUUID() + "_" + cleanFileName;

//             // ===== UPLOAD TO MINIO =====
//             minioClient.putObject(
//                     PutObjectArgs.builder()
//                             .bucket(bucket)
//                             .object(fileName)
//                             .stream(file.getInputStream(), file.getSize(), -1)
//                             .contentType(file.getContentType())
//                             .build()
//             );

//             // ===== PUBLIC URL =====
//             String publicBase = publicUrl.endsWith("/")
//                     ? publicUrl.substring(0, publicUrl.length() - 1)
//                     : publicUrl;

//             String filePublicUrl = String.format(
//                     "%s/api/files/%s",
//                     publicBase,
//                     fileName
//             );

//             log.info("Upload success: {}", filePublicUrl);

//             // ===== RETURN DTO (KHÔNG dùng builder) =====
//             return new FileResponse(
//                     originalName,                 // fileName
//                     filePublicUrl,                // url
//                     file.getContentType(),        // contentType
//                     file.getSize()                // size
//             );

//         } catch (Exception e) {
//             log.error("Upload error: {}", e.getMessage());
//             throw new RuntimeException("Upload file failed: " + e.getMessage());
//         }
//     }
// }