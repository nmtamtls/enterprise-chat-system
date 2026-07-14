export const loginApi = async (data) => {
  // Ưu tiên dùng link Dev Tunnel để máy tính bảng kết nối được
  const res = await fetch("http://localhost:8082/api/auth/login", {

  // const res = await fetch("https://tqgwvv8g-8082.asse.devtunnels.ms/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Thêm header này để tránh trang cảnh báo của Microsoft Dev Tunnel nếu cần
      "X-Skip-Publisher-Unknown-Check": "true"
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  // Nếu login thành công (Khớp với cấu hình Backend của bạn)
  if (res.ok && result.token) {
    localStorage.setItem("token", result.token);
    localStorage.setItem("username", result.username);
    
    // 🔥 QUAN TRỌNG: Lưu toàn bộ object user hoặc ít nhất là Role
    // Giả sử Backend trả về result.role (ADMIN hoặc USER)
    const userData = {
      username: result.username,
      role: result.role // Đảm bảo Backend trả về field này
    };
    
    localStorage.setItem("user", JSON.stringify(userData));
  }

  return result;
};