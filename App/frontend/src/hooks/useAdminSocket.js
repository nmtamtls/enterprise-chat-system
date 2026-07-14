// src/hooks/useAdminSocket.js
import { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

/**
 * Hook quản lý kết nối WebSocket dành riêng cho Admin
 * Lắng nghe các sự kiện báo cáo (reports) hoặc thông báo hệ thống
 */
export const useAdminSocket = () => {
    const [notifications, setNotifications] = useState([]);
    const [latestReport, setLatestReport] = useState(null);

    useEffect(() => {
        // 1. Khởi tạo kết nối tới endpoint WebSocket đã cấu hình ở Backend
        const socket = new SockJS('http://localhost:8082/ws'); 
        // const socket = new SockJS('https://tqgwvv8g-8082.asse.devtunnels.ms/ws'); 
        const client = Stomp.over(socket);

        // 2. Kết nối tới server
        client.connect({}, () => {
            console.log("Admin WebSocket Connected");

            // Lắng nghe topic báo cáo mới
            client.subscribe('/topic/admin/reports', (message) => {
                const newReport = JSON.parse(message.body);
                setLatestReport(newReport);
                setNotifications(prev => [newReport, ...prev]);
            });
        }, (error) => {
            console.error("WebSocket Error: ", error);
        });

        // Cleanup khi component bị hủy
        return () => {
            if (client) {
                client.disconnect();
            }
        };
    }, []);

    return { notifications, latestReport };
};