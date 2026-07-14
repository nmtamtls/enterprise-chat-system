// package com.chatapp.backend.report.repository;

// import java.util.List;
// import java.util.UUID;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;
// import com.chatapp.backend.report.entity.Report;

// @Repository
// public interface ReportRepository extends JpaRepository<Report, UUID> {

//     long countByStatus(String status);

//     // Trả về danh sách theo status (không cần JOIN vì không dùng @ManyToOne)
//     List<Report> findByStatus(String status);

//     List<Report> findByReporterId(UUID reporterId);

//     List<Report> findByMessageId(UUID messageId);
// }


package com.chatapp.backend.report.repository;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.chatapp.backend.report.entity.Report;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID> {

    long countByStatus(String status);

    // Trả về danh sách theo status
    List<Report> findByStatus(String status);

    // Tìm các báo cáo do user này tạo ra
    List<Report> findByReporterId(UUID reporterId);

    // Tìm các báo cáo nhắm vào user này (rất cần cho Admin xem hồ sơ bị báo cáo)
    List<Report> findByTargetId(UUID targetId);

    // Tìm các báo cáo nhắm vào tin nhắn cụ thể
    List<Report> findByMessageId(UUID messageId);

    boolean existsByReporterIdAndTargetIdAndReportType(UUID reporterId, UUID targetId, String reportType);

    // // Kiểm tra xem báo cáo này đã tồn tại hay chưa (giúp tránh spam báo cáo)
    // boolean existsByReporterIdAndTargetId(UUID reporterId, UUID targetId);
}