# Enterprise Chat System (Hệ thống giao tiếp nội bộ trong doanh nghiệp)

## Giới thiệu

Enterprise Chat System là hệ thống giao tiếp nội bộ trong doanh nghiệp, được xây dựng nhằm hỗ trợ nhân viên trao đổi thông tin nhanh chóng, bảo mật và hiệu quả.

Hệ thống cung cấp các chức năng nhắn tin thời gian thực, quản lý người dùng, trò chuyện cá nhân/nhóm, chia sẻ tệp, quản lý quyền và hỗ trợ quản trị viên.

## Chức năng chính

### Người dùng
- Đăng ký, đăng nhập và quản lý tài khoản.
- Cập nhật thông tin cá nhân.
- Tìm kiếm người dùng.
- Nhắn tin cá nhân và nhóm theo thời gian thực.
- Gửi tin nhắn văn bản, hình ảnh, tệp.
- Hiển thị trạng thái online/offline.
- Quản lý trạng thái tin nhắn (đã gửi, đã nhận, đã đọc).
- Thả cảm xúc và quản lý hội thoại.

### Quản trị viên
- Quản lý tài khoản người dùng.
- Theo dõi hoạt động hệ thống.
- Quản lý báo cáo.
- Ghi nhận lịch sử thao tác quản trị.

## Công nghệ sử dụng

### Backend
- Java 17 (có thể dùng version 21)
- Spring Boot
- Spring Security + JWT
- Spring Data JPA
- WebSocket STOMP
- MQTT (EMQX)

### Frontend
- ReactJS
- Ant Design
- Axios
- STOMP Client
- SockJS

### Database & Storage
- PostgreSQL
- MinIO (lưu trữ tệp)
- Docker Compose

## Kiến trúc hệ thống

Hệ thống được xây dựng theo mô hình Client - Server:

- Frontend ReactJS chịu trách nhiệm giao diện người dùng.
- Backend Spring Boot cung cấp REST API và xử lý nghiệp vụ.
- WebSocket hỗ trợ giao tiếp thời gian thực.
- PostgreSQL lưu trữ dữ liệu hệ thống.
- MinIO quản lý dữ liệu tệp.


## Cài đặt hệ thống

Chi tiết cài đặt được trình bày trong thư mục:

Bao gồm:

- Cài đặt Backend.
- Cài đặt Frontend.
- Cấu hình Docker.
- Kết nối Database.
- Kiểm thử API bằng Postman.

## Database

File khởi tạo cơ sở dữ liệu: Tai_lieu_huong_dan_cai_dat/dump-chat_db-202607041815.sql

## Mục tiêu phát triển

- Xây dựng nền tảng trao đổi thông tin nội bộ an toàn.
- Hỗ trợ doanh nghiệp quản lý giao tiếp tập trung.
- Có khả năng mở rộng thêm các chức năng quản lý và cộng tác trong tương lai.

## Tác giả

Nguyễn Minh Tâm

Đồ án tốt nghiệp:
"Xây dựng hệ thống giao tiếp nội bộ trong doanh nghiệp"


