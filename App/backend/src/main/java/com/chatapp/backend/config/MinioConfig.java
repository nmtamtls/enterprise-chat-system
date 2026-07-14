// package com.chatapp.backend.config;

// import io.minio.*;
// import jakarta.annotation.PostConstruct;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class MinioConfig {

//     private static final Logger logger = LoggerFactory.getLogger(MinioConfig.class);

//     @Value("${minio.url}")
//     private String url;

//     @Value("${minio.access-key}")
//     private String accessKey;

//     @Value("${minio.secret-key}")
//     private String secretKey;

//     @Value("${minio.bucket}")
//     private String bucketName;

//     // ================= BEAN =================
//     @Bean
//     public MinioClient minioClient() {
//         return MinioClient.builder()
//                 .endpoint(url)
//                 .credentials(accessKey, secretKey)
//                 .build();
//     }

//     // ================= INIT =================
//     @PostConstruct
//     public void init() {
//         try {
//             MinioClient client = minioClient();

//             logger.info(">>> Checking MinIO: {}", url);

//             // 1. CREATE BUCKET IF NOT EXISTS
//             boolean exists = client.bucketExists(
//                     BucketExistsArgs.builder()
//                             .bucket(bucketName)
//                             .build()
//             );

//             if (!exists) {
//                 client.makeBucket(
//                         MakeBucketArgs.builder()
//                                 .bucket(bucketName)
//                                 .build()
//                 );
//                 logger.info(">>> Created bucket: {}", bucketName);
//             }

//             // 2. PUBLIC READ POLICY (FIXED)
//             String policy = """
//             {
//               "Version": "2012-10-17",
//               "Statement": [
//                 {
//                   "Effect": "Allow",
//                   "Principal": "*",
//                   "Action": ["s3:GetObject"],
//                   "Resource": [
//                     "arn:aws:s3:::%s",
//                     "arn:aws:s3:::%s/*"
//                   ]
//                 }
//               ]
//             }
//             """.formatted(bucketName, bucketName);

//             client.setBucketPolicy(
//                     SetBucketPolicyArgs.builder()
//                             .bucket(bucketName)
//                             .config(policy)
//                             .build()
//             );

//             logger.info(">>> MinIO bucket '{}' is PUBLIC READ READY", bucketName);

//         } catch (Exception e) {
//             logger.error(">>> MinIO init failed: {}", e.getMessage(), e);
//         }
//     }
// }







// package com.chatapp.backend.config;

// import io.minio.*;
// import jakarta.annotation.PostConstruct;
// import org.slf4j.Logger;
// import org.slf4j.LoggerFactory;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

// @Configuration
// public class MinioConfig {

//     private static final Logger logger = LoggerFactory.getLogger(MinioConfig.class);

//     @Value("${minio.url}")
//     private String url;

//     @Value("${minio.access-key}")
//     private String accessKey;

//     @Value("${minio.secret-key}")
//     private String secretKey;

//     @Value("${minio.bucket}")
//     private String bucketName;

//     // ================= BEAN =================
//     @Bean
//     public MinioClient minioClient() {
//         return MinioClient.builder()
//                 .endpoint(url)
//                 .credentials(accessKey, secretKey)
//                 .build();
//     }

//     // ================= INIT =================
//     @PostConstruct
//     public void init() {
//         try {
//             // ❗ KHÔNG gọi minioClient() nữa
//             MinioClient client = MinioClient.builder()
//                     .endpoint(url)
//                     .credentials(accessKey, secretKey)
//                     .build();

//             logger.info(">>> Checking MinIO: {}", url);

//             boolean exists = client.bucketExists(
//                     BucketExistsArgs.builder()
//                             .bucket(bucketName)
//                             .build()
//             );

//             if (!exists) {
//                 client.makeBucket(
//                         MakeBucketArgs.builder()
//                                 .bucket(bucketName)
//                                 .build()
//                 );
//                 logger.info(">>> Created bucket: {}", bucketName);
//             }

//             String policy = """
//             {
//               "Version": "2012-10-17",
//               "Statement": [
//                 {
//                   "Effect": "Allow",
//                   "Principal": "*",
//                   "Action": ["s3:GetObject"],
//                   "Resource": [
//                     "arn:aws:s3:::%s",
//                     "arn:aws:s3:::%s/*"
//                   ]
//                 }
//               ]
//             }
//             """.formatted(bucketName, bucketName);

//             client.setBucketPolicy(
//                     SetBucketPolicyArgs.builder()
//                             .bucket(bucketName)
//                             .config(policy)
//                             .build()
//             );

//             logger.info(">>> MinIO bucket '{}' is READY", bucketName);

//         } catch (Exception e) {
//             logger.error(">>> MinIO init failed", e);
//         }
//     }
// }





package com.chatapp.backend.config;

import io.minio.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;

@Configuration
public class MinioConfig {

    private static final Logger logger = LoggerFactory.getLogger(MinioConfig.class);

    @Value("${minio.url}")
    private String url;

    @Value("${minio.access-key}")
    private String accessKey;

    @Value("${minio.secret-key}")
    private String secretKey;

    @Value("${minio.bucket}")
    private String bucketName;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
    }

    @PostConstruct
    public void init() {
        try {
            // Sử dụng Bean đã được định nghĩa
            MinioClient client = minioClient();

            logger.info(">>> Checking MinIO connectivity at: {}", url);

            // Kiểm tra và tạo bucket nếu chưa tồn tại
            boolean exists = client.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build()
            );

            if (!exists) {
                client.makeBucket(
                        MakeBucketArgs.builder().bucket(bucketName).build()
                );
                logger.info(">>> Created bucket: {}", bucketName);
            }

            // LƯU Ý: Đã xóa đoạn setBucketPolicy. 
            // MinIO mặc định là PRIVATE. Đây là mức bảo mật cao nhất cho E2EE.

            logger.info(">>> MinIO bucket '{}' is READY and PRIVATE.", bucketName);

        } catch (Exception e) {
            logger.error(">>> MinIO initialization failed: {}", e.getMessage());
        }
    }
}