

// src/api/messageApi.js
import axios from "axios";
const getBaseUrl = () => {
  return "http://localhost:8082/api";
  //  return "https://tqgwvv8g-8082.asse.devtunnels.ms/api";
};

// =====================================================
// AUTH HEADER
// =====================================================
const getAuthHeaders = () => {

  const token = localStorage.getItem("token");

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// =====================================================
// 1. LẤY DANH SÁCH TIN NHẮN
// =====================================================
export const getMessagesApi = async (conversationId) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/conversation/${conversationId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể tải tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("getMessagesApi error:", err);

    return {
      success: false,
      data: [],
    };
  }
};

// =====================================================
// 2. GỬI TIN NHẮN
// =====================================================
export const sendMessageApi = async (messageData) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(messageData),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể gửi tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("sendMessageApi error:", err);

    return {
      success: false,
    };
  }
};

// =====================================================
// 3. GHIM TIN NHẮN
// =====================================================
export const pinMessageApi = async (messageId) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/${messageId}/pin`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể ghim tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("pinMessageApi error:", err);

    return {
      success: false,
    };
  }
};

// =====================================================
// 4. BỎ GHIM TIN NHẮN
// =====================================================
export const unpinMessageApi = async (messageId) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/${messageId}/unpin`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể bỏ ghim tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("unpinMessageApi error:", err);

    return {
      success: false,
    };
  }
};

// =====================================================
// 5. LẤY DANH SÁCH TIN NHẮN ĐÃ GHIM
// =====================================================
export const getPinnedMessagesApi = async (conversationId) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/conversation/${conversationId}/pinned`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể tải danh sách tin nhắn ghim");
    }

    return await res.json();

  } catch (err) {

    console.error("getPinnedMessagesApi error:", err);

    return {
      success: false,
      data: [],
    };
  }
};

// =====================================================
// 6. ĐÁNH DẤU ĐÃ ĐỌC
// =====================================================
export const markMessageAsReadApi = async (
  conversationId,
  userId
) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/${conversationId}/read?userId=${userId}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể đánh dấu đã đọc");
    }

    return await res.json();

  } catch (err) {

    console.error("markMessageAsReadApi error:", err);

    return {
      success: false,
    };
  }
};

// =====================================================
// 7. THU HỒI TIN NHẮN
// =====================================================
export const recallMessageApi = async (
  messageId,
  senderId
) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/${messageId}/recall?senderId=${senderId}`,
      {
        method: "PATCH",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể thu hồi tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("recallMessageApi error:", err);

    return {
      success: false,
    };
  }
};

// =====================================================
// 8. CHỈNH SỬA TIN NHẮN
// =====================================================
export const editMessageApi = async (
  messageId,
  senderId,
  content
) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/${messageId}/edit?senderId=${senderId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể chỉnh sửa tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("editMessageApi error:", err);

    return {
      success: false,
    };
  }
};

// =====================================================
// 9. TRẢ LỜI TIN NHẮN
// =====================================================
export const replyMessageApi = async (
  conversationId,
  senderId,
  content,
  replyToId
) => {

  try {

    const res = await fetch(
      `${getBaseUrl()}/messages/${conversationId}/reply?senderId=${senderId}`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          content,
          replyToId,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Không thể trả lời tin nhắn");
    }

    return await res.json();

  } catch (err) {

    console.error("replyMessageApi error:", err);

    return {
      success: false,
    };
  }
};
// =====================================================
// 10. LẤY UNREAD COUNT
// =====================================================
// export const getUnreadCountApi = async (userId) => {

//   try {

//     const res = await fetch(
//       `${getBaseUrl()}/messages/unread-count/${userId}`,
//       {
//         method: "GET",
//         headers: getAuthHeaders(),
//       }
//     );

//     if (!res.ok) {
//       throw new Error("Không thể lấy unread count");
//     }

//     return await res.json();

//   } catch (err) {

//     console.error("getUnreadCountApi error:", err);

//     return {
//       success: false,
//       data: 0,
//     };
//   }
// };
export const getUnreadCountApi = async (userId) => {
  try {
    const res = await axios.get(`${getBaseUrl()}/messages/unread-count/${userId}`, {
      headers: getAuthHeaders()
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("getUnreadCountApi error:", err);
    return { success: false, data: 0 };
  }
};

// =====================================================
// 11. LẤY DANH SÁCH REACTIONS CỦA TIN NHẮN
// =====================================================
export const getMessageReactionsApi = async (messageId) => {
  try {
    const res = await axios.get(`${getBaseUrl()}/messages/${messageId}/reactions`, {
      headers: getAuthHeaders(),
    });
    return { success: true, data: res.data };
  } catch (err) {
    console.error("getMessageReactionsApi error:", err);
    return { success: false, data: [] };
  }
};

// =====================================================
// 12. GỬI PHẢN HỒI (REACTION) - CÁCH GỌI API (TÙY CHỌN)
// =====================================================
// Lưu ý: Thường bạn dùng WebSocket cho việc này, 
// nhưng nếu cần gọi qua HTTP để lưu DB trước, hãy dùng hàm này:
export const reactMessageApi = async (messageId, userId, emoji, action) => {
  try {
    const res = await axios.post(
      `${getBaseUrl()}/messages/${messageId}/react`,
      {
        userId,
        emoji,
        action, // "ADD" hoặc "REMOVE"
      },
      {
        headers: getAuthHeaders(),
      }
    );
    return { success: true, data: res.data };
  } catch (err) {
    console.error("reactMessageApi error:", err);
    return { success: false };
  }
};