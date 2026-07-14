// package com.chatapp.backend.contact.dto;

// public class ContactResponse {

//     private String id;
//     private String username;
//     private String fullName;
//     private String avatarUrl;
//     private boolean isOnline;

//     public ContactResponse(String id,
//                            String username,
//                            String fullName,
//                            String avatarUrl,
//                            boolean isOnline) {
//         this.id = id;
//         this.username = username;
//         this.fullName = fullName;
//         this.avatarUrl = avatarUrl;
//         this.isOnline = isOnline;
//     }

//     public String getId() {
//         return id;
//     }

//     public String getUsername() {
//         return username;
//     }

//     public String getFullName() {
//         return fullName;
//     }

//     public String getAvatarUrl() {
//         return avatarUrl;
//     }

//     public boolean isOnline() {
//         return isOnline;
//     }
// }


package com.chatapp.backend.contact.dto;

public class ContactResponse {

    private String id;
    private String username;
    private String fullName;
    private String avatarUrl;
    private boolean isOnline;

    // 1. Constructor không tham số (BẮT BUỘC để Jackson có thể Serialize/Deserialize)
    public ContactResponse() {
    }

    // 2. Constructor đầy đủ tham số (Bạn đã có)
    public ContactResponse(String id,
                           String username,
                           String fullName,
                           String avatarUrl,
                           boolean isOnline) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.isOnline = isOnline;
    }

    // 3. Đầy đủ Getter và Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public boolean isOnline() {
        return isOnline;
    }

    public void setOnline(boolean online) {
        isOnline = online;
    }
}   