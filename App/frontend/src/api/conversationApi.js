
const BASE_URL =
  "http://localhost:8082/api/conversations";

// const BASE_URL =
//   "https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations";
// =====================================================
// HEADERS
// =====================================================

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization:
    `Bearer ${localStorage.getItem("token")}`,
});

const getAuthHeaders = () => ({
  Authorization:
    `Bearer ${localStorage.getItem("token")}`,
});

// =====================================================
// CHAT 1-1
// =====================================================

export const getOrCreateConversationApi =
  async (
    currentUserId,
    targetUserId
  ) => {

    const res = await fetch(
      `${BASE_URL}`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          type: "PRIVATE",
          createdBy: currentUserId,
          memberIds: [
            currentUserId,
            targetUserId,
          ],
        }),
      }
    );

    if (!res.ok) {
      throw new Error(
        "Không thể tạo cuộc trò chuyện"
      );
    }

    return res.json();
  };

// =====================================================
// CREATE GROUP
// =====================================================

export const createGroupApi = async (
  currentUserId,
  groupName,
  selectedMemberIds
) => {

  const res = await fetch(
    `${BASE_URL}`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        type: "GROUP",
        name: groupName,
        createdBy: currentUserId,
        memberIds: [
          ...selectedMemberIds,
          currentUserId,
        ],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(
      "Không thể tạo nhóm"
    );
  }

  return res.json();
};

// =====================================================
// UPDATE GROUP AVATAR
// =====================================================

export const updateGroupAvatarApi =
  async (
    conversationId,
    file
  ) => {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const res = await fetch(
      `${BASE_URL}/${conversationId}/avatar`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${localStorage.getItem("token")}`,
        },

        body: formData,
      }
    );

    const data =
      await res.json();

    if (!res.ok) {

      throw new Error(
        data?.message ||
        "Không thể cập nhật avatar nhóm"
      );
    }

    return data;
};
// =====================================================
// UPDATE GROUP NAME
// =====================================================

export const updateGroupNameApi =
  async (
    conversationId,
    name
  ) => {

    const res = await fetch(
      `${BASE_URL}/${conversationId}/name`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          name,
        }),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {

      throw new Error(
        data?.message ||
        "Lỗi cập nhật tên nhóm"
      );
    }

    return data;
  };

// =====================================================
// LEAVE GROUP
// =====================================================

export const leaveGroupApi =
  async (
    conversationId
  ) => {

    const res = await fetch(
      `${BASE_URL}/${conversationId}/leave`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {

      throw new Error(
        data?.message ||
        "Không thể rời nhóm"
      );
    }

    return data;
  };

// =====================================================
// DELETE GROUP
// =====================================================

export const deleteGroupApi =
  async (
    conversationId
  ) => {

    const res = await fetch(
      `${BASE_URL}/${conversationId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    const data =
      await res.json();

    if (!res.ok) {

      throw new Error(
        data?.message ||
        "Không thể giải tán nhóm"
      );
    }

    return data;
  };

// =====================================================
// GET USER CONVERSATIONS
// =====================================================

export const getUserConversationsApi =
  async (userId) => {

    const res = await fetch(
      `${BASE_URL}/user/${userId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {

      throw new Error(
        "Không tải được danh sách chat"
      );
    }

    return res.json();
  };

  // =====================================================
// SEARCH MEMBERS IN CONVERSATION
// =====================================================

export const searchMembersApi = async (conversationId, query) => {
  const res = await fetch(
    `${BASE_URL}/${conversationId}/members/search?query=${encodeURIComponent(query)}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data?.message || "Không thể tìm kiếm thành viên"
    );
  }

  return data;
};
// =====================================================
// REMOVE MEMBER FROM GROUP (Đã sửa đường dẫn)
// =====================================================

export const removeMemberFromGroupApi = async (conversationId, userId) => {
  // Thay đổi "/remove/" thành "/members/" để khớp với Backend
  const res = await fetch(
    `${BASE_URL}/${conversationId}/members/${userId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  // Kiểm tra xem phản hồi có nội dung không trước khi parse JSON
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    throw new Error(
      data?.message || "Không thể xóa thành viên khỏi nhóm"
    );
  }

  return data;
};