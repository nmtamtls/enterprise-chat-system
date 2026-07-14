
import axios from "axios";

const BASE_URL = "http://localhost:8082/api/admin";
// const BASE_URL = "https://tqgwvv8g-8082.asse.devtunnels.ms/api/admin";
// Helper để tạo cấu hình header nhanh
const authHeader = (token) => ({
  headers: { Authorization: "Bearer " + token },
});

// ================= ADMIN DASHBOARD =================
export const getDashboard = (token) =>
  axios.get(`${BASE_URL}/dashboard`, authHeader(token));

// ================= USER MANAGEMENT =================
export const getAllUsers = (token) =>
  axios.get(`${BASE_URL}/users`, authHeader(token));

export const deleteUser = (id, token) =>
  axios.delete(`${BASE_URL}/users/${id}`, authHeader(token));

// ================= REPORT MANAGEMENT (BỔ SUNG MỚI) =================
export const getAllReports = (token) =>
  axios.get(`${BASE_URL}/reports`, authHeader(token));

export const updateReportStatus = (reportId, status, token) =>
  axios.put(`${BASE_URL}/reports/${reportId}/status`, status, {
    headers: { 
      Authorization: "Bearer " + token,
      "Content-Type": "application/json" 
    },
  });

// ================= MESSAGE & CONVERSATION MANAGEMENT =================
export const deleteMessage = (id, token) =>
  axios.delete(`${BASE_URL}/messages/${id}`, authHeader(token));

export const deleteConversation = (id, token) =>
  axios.delete(`${BASE_URL}/conversations/${id}`, authHeader(token));