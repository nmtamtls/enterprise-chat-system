import React, { useState, useMemo } from "react";
import axios from "axios";
import styles from "../../styles/Home.module.css"; 

export default function AddFriendModal({
  isOpen,
  onClose,
  user,
  token,
  allUsers,
  friends,
  pendingRequests,
  sentRequests,
  onFriendRequestSent,
}) {
  const [friendSearchQuery, setFriendSearchQuery] = useState("");
  const [requestStatus, setRequestStatus] = useState({});

  /**
   * 1. Hook tính toán danh sách bạn bè (Luôn chạy)
   */
  const friendIds = useMemo(() => {
    if (!friends) return new Set();
    return new Set(friends.map(f => String(f.id)));
  }, [friends]);

  /**
   * 2. Hook lọc danh sách hiển thị (Luôn chạy)
   * Di chuyển lên trên lệnh IF
   */
  const filteredUsers = useMemo(() => {
    if (friendSearchQuery.trim() === "") return [];

    return allUsers.filter((u) => {
      const isMe = String(u.id) === String(user.id);
      const isAlreadyFriend = friendIds.has(String(u.id));
      const matchesSearch = (u.full_name || u.username || "")
        .toLowerCase()
        .includes(friendSearchQuery.toLowerCase());

      return !isMe && !isAlreadyFriend && matchesSearch;
    });
  }, [allUsers, friendSearchQuery, friendIds, user.id]);

  /**
   * 3. KIỂM TRA ĐIỀU KIỆN RENDER (Đặt sau tất cả Hooks)
   */
  if (!isOpen) return null;

  // const handleAddFriend = async (targetUserId) => {
  //   setRequestStatus((prev) => ({ ...prev, [targetUserId]: "loading" }));
  //   try {
  //     await axios.post(
  //       `http://localhost:8082/api/contacts/${user.id}`,
  //       { contactUserId: targetUserId },
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setRequestStatus((prev) => ({ ...prev, [targetUserId]: "success" }));
  //   } catch (err) {
  //     const errorResponse = err.response?.data?.message || "";
  //     if (errorResponse.includes("already exists") || errorResponse.includes("already friends")) {
  //       setRequestStatus((prev) => ({ ...prev, [targetUserId]: "success" }));
  //     } else {
  //       alert("Lỗi: " + (errorResponse || "Không thể gửi lời mời"));
  //       setRequestStatus((prev) => ({ ...prev, [targetUserId]: null }));
  //     }
  //   }
  // };
const handleAddFriend = async (targetUserId) => {
  setRequestStatus((prev) => ({
    ...prev,
    [targetUserId]: "loading",
  }));

  try {
    await axios.post(
      `http://localhost:8082/api/contacts/${user.id}`,
      // `https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/${user.id}`,
      { contactUserId: targetUserId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // realtime local update
    if (typeof onFriendRequestSent === "function") {
      onFriendRequestSent(targetUserId);
    }

    setRequestStatus((prev) => ({
      ...prev,
      [targetUserId]: "success",
    }));
  } catch (err) {
    const errorResponse = err.response?.data?.message || "";

    if (
      errorResponse.includes("already exists") ||
      errorResponse.includes("already friends")
    ) {
      // vẫn cập nhật UI local
      if (typeof onFriendRequestSent === "function") {
        onFriendRequestSent(targetUserId);
      }

      setRequestStatus((prev) => ({
        ...prev,
        [targetUserId]: "success",
      }));
    } else {
      alert("Lỗi: " + (errorResponse || "Không thể gửi lời mời"));

      setRequestStatus((prev) => ({
        ...prev,
        [targetUserId]: null,
      }));
    }
  }
};
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button 
          className={styles.modalCloseBtn} 
          onClick={() => {
            setFriendSearchQuery("");
            onClose();
          }}
        >✕</button>

        <h2 className={styles.modalTitle}>Thêm nhân sự mới</h2>
        <p className={styles.modalSubtitle}>Tìm kiếm đồng nghiệp kết nối</p>

        <div style={{ marginBottom: "15px" }}>
          <label className={styles.inputLabel}>Tìm kiếm người dùng</label>
          <input
            type="text"
            className={styles.modalInput}
            placeholder="Nhập tên hoặc @username..."
            value={friendSearchQuery}
            onChange={(e) => setFriendSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.memberList} style={{ minHeight: "150px", maxHeight: "300px", overflowY: "auto" }}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => (
              <div key={u.id} className={styles.memberItem}>
                <div className={styles.avatarContainer}>
                   <img src={u.avatar_url || "/default-avatar.png"} className={styles.memberAvatar} alt="" />
                </div>
                <div style={{ flex: 1, marginLeft: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#fff" }}>
                    {u.full_name || u.username}
                  </div>
                  <div style={{ fontSize: "12px", color: "#b5bac1" }}>@{u.username}</div>
                </div>

                {requestStatus[u.id] === "success" ? (
                  <span style={{ color: "#23a55a", fontSize: "13px", fontWeight: "bold" }}>✓ Đã gửi</span>
                ) : (
                  <button
                    className={styles.btnCreate}
                    style={{ padding: "6px 16px", width: "auto", fontSize: "12px", margin: 0 }}
                    onClick={() => handleAddFriend(u.id)}
                    disabled={requestStatus[u.id] === "loading"}
                  >
                    {requestStatus[u.id] === "loading" ? "..." : "Kết nối"}
                  </button>
                )}
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#b5bac1" }}>
              <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔍</div>
              {friendSearchQuery 
                ? "Không tìm thấy kết quả hoặc họ đã là đồng nghiệp." 
                : "Nhập tên để bắt đầu tìm kiếm."}
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.btnBack} style={{ width: "100%" }} onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}