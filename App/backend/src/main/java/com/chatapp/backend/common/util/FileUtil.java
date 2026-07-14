package com.chatapp.backend.common.util;

import java.util.UUID;

public class FileUtil {

    // tạo tên file unique
    public static String generateFileName(String originalName) {
        return UUID.randomUUID() + "_" + originalName;
    }

    // lấy extension file
    public static String getExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) return "";
        return fileName.substring(fileName.lastIndexOf("."));
    }

    // kiểm tra file ảnh
    public static boolean isImage(String fileName) {
        String ext = getExtension(fileName).toLowerCase();
        return ext.equals(".jpg") || ext.equals(".png") || ext.equals(".jpeg");
    }
}