import axios from 'axios';

const API_URL = "http://localhost:8082/api/reports";
// const API_URL = "https://tqgwvv8g-8082.asse.devtunnels.ms/api/reports";
const reportApi = {
    sendReport: async (reportData) => {
        const token = localStorage.getItem("token");
        
        // Log để kiểm tra sự tồn tại của token
        console.log("--- Debug Report API ---");  
        console.log("Token:", token ? "Token đã tồn tại" : "KHÔNG TÌM THẤY TOKEN!");
        console.log("Payload gửi đi:", reportData);

        if (!token) {
            throw new Error("Người dùng chưa đăng nhập!");
        }

        try {
            const response = await axios.post(API_URL, reportData, {
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                }
            });
            console.log("Phản hồi từ Server:", response.data);
            return response;
        } catch (error) {
            console.error("Lỗi Axios chi tiết:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                headers: error.config.headers
            });
            throw error; // Ném lại lỗi để ReportModal xử lý hiển thị message
        }
    }
};

export default reportApi;