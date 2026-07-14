// package com.chatapp.backend.admin.dto;

// public class AdminDashboardResponse {

//     private long totalUsers;
//     private long totalMessages;
//     private long totalFiles;
//     private long totalConversations;

//     public AdminDashboardResponse() {}

//     public AdminDashboardResponse(long totalUsers, long totalMessages,
//                                   long totalFiles, long totalConversations) {
//         this.totalUsers = totalUsers;
//         this.totalMessages = totalMessages;
//         this.totalFiles = totalFiles;
//         this.totalConversations = totalConversations;
//     }

//     // Getters và Setters
//     public long getTotalUsers() { return totalUsers; }
//     public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

//     public long getTotalMessages() { return totalMessages; }
//     public void setTotalMessages(long totalMessages) { this.totalMessages = totalMessages; }

//     public long getTotalFiles() { return totalFiles; }
//     public void setTotalFiles(long totalFiles) { this.totalFiles = totalFiles; }

//     public long getTotalConversations() { return totalConversations; }
//     public void setTotalConversations(long totalConversations) { this.totalConversations = totalConversations; }
// }


package com.chatapp.backend.admin.dto;

public class AdminDashboardResponse {

    private long totalUsers;
    private long totalMessages;
    private long totalFiles;
    private long totalConversations;
    private long totalReports;
    private long pendingReports;

    public AdminDashboardResponse() {}

    // Constructor cập nhật để nhận đủ 6 tham số
    public AdminDashboardResponse(long totalUsers, long totalMessages,
                                  long totalFiles, long totalConversations,
                                  long totalReports, long pendingReports) {
        this.totalUsers = totalUsers;
        this.totalMessages = totalMessages;
        this.totalFiles = totalFiles;
        this.totalConversations = totalConversations;
        this.totalReports = totalReports;
        this.pendingReports = pendingReports;
    }

    // Getters và Setters hiện có
    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalMessages() { return totalMessages; }
    public void setTotalMessages(long totalMessages) { this.totalMessages = totalMessages; }

    public long getTotalFiles() { return totalFiles; }
    public void setTotalFiles(long totalFiles) { this.totalFiles = totalFiles; }

    public long getTotalConversations() { return totalConversations; }
    public void setTotalConversations(long totalConversations) { this.totalConversations = totalConversations; }

    // Getters và Setters mới cho báo cáo
    public long getTotalReports() { return totalReports; }
    public void setTotalReports(long totalReports) { this.totalReports = totalReports; }

    public long getPendingReports() { return pendingReports; }
    public void setPendingReports(long pendingReports) { this.pendingReports = pendingReports; }
}