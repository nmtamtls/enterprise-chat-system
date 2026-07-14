import React, { useState } from "react";

import {
  uploadAvatarApi,
  updateProfileApi
} from "../../api/UserApi";

export default function UserDetailModal({
  user,
  onClose,
  reloadUser,
}) {

  // =====================================================
  // STATE
  // =====================================================

  const [fullName, setFullName] = useState(
    user?.fullName ||
    user?.full_name ||
    ""
  );

  const [previewAvatar, setPreviewAvatar] =
    useState(
      user?.avatarUrl ||
      user?.avatar_url ||
      "https://cdn.discordapp.com/embed/avatars/0.png"
    );

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // HANDLE SELECT AVATAR
  // =====================================================

  const handleSelectAvatar = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setSelectedFile(file);

    setPreviewAvatar(
      URL.createObjectURL(file)
    );
  };

  // =====================================================
  // HANDLE SAVE PROFILE
  // =====================================================


  const handleSave = async () => {
    try {
      setLoading(true);

      // 1. Upload Avatar trước (nếu có)
      if (selectedFile) {
        await uploadAvatarApi(selectedFile);
      }

      // 2. Cập nhật Profile (tên)
      // Lưu ý: Backend của bạn sẽ xử lý bắn tin nhắn WebSocket tại đây
      await updateProfileApi({ fullName });

      // 3. Reload lại data nếu cần (tùy chọn)
      if (reloadUser) {
        await reloadUser();
      }

      alert("Cập nhật hồ sơ thành công");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Cập nhật hồ sơ thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="profile-board"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ========================================= */}
        {/* BANNER */}
        {/* ========================================= */}

        <div
          className="banner"
          style={{
            backgroundColor: "#5865f2",
          }}
        />

        {/* ========================================= */}
        {/* CONTENT */}
        {/* ========================================= */}

        <div className="content">

          {/* ===================================== */}
          {/* AVATAR */}
          {/* ===================================== */}

          <img
            className="large-avatar"
            src={previewAvatar}
            alt="avatar"
          />

          {/* ===================================== */}
          {/* CHANGE AVATAR */}
          {/* ===================================== */}

          <label className="avatar-upload-btn">

            Đổi ảnh

            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleSelectAvatar}
            />

          </label>

          {/* ===================================== */}
          {/* INFO BOX */}
          {/* ===================================== */}

          <div className="info-box">

            <h3>
              {user?.username}
            </h3>

            <p className="user-tag">
              @{user?.username}
            </p>

            <div className="separator" />

            {/* ================================= */}
            {/* FULL NAME */}
            {/* ================================= */}

            <div className="detail-item">

              <label>HỌ TÊN</label>

              <input
                className="input-field"
                value={fullName}
                onChange={(e) =>
                  setFullName(e.target.value)
                }
              />

            </div>

            {/* ================================= */}
            {/* EMAIL */}
            {/* ================================= */}

            <div className="detail-item">

              <label>EMAIL</label>

              <p>{user?.email}</p>

            </div>

            {/* ================================= */}
            {/* ROLE */}
            {/* ================================= */}

            <div className="detail-item">

              <label>VAI TRÒ</label>

              <p>
                {user?.role || "USER"}
              </p>

            </div>

          </div>

          {/* ===================================== */}
          {/* ACTIONS */}
          {/* ===================================== */}

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {
              loading
                ? "Đang lưu..."
                : "Lưu thay đổi"
            }
          </button>

          <button
            className="close-btn"
            onClick={onClose}
          >
            Đóng
          </button>

        </div>

      </div>

      {/* ========================================= */}
      {/* STYLE */}
      {/* ========================================= */}

      <style>{`

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.85);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .profile-board {
          width: 320px;
          background: #111214;
          border-radius: 10px;
          overflow: hidden;
        }

        .banner {
          height: 70px;
        }

        .content {
          padding: 16px;
          position: relative;
        }

        .large-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          border: 6px solid #111214;
          position: absolute;
          top: -40px;
          object-fit: cover;
        }

        .avatar-upload-btn {
          margin-left: 95px;
          color: #4ea1ff;
          cursor: pointer;
          font-size: 13px;
        }

        .info-box {
          margin-top: 45px;
          background: #1e1f22;
          padding: 12px;
          border-radius: 8px;
        }

        .info-box h3 {
          color: white;
          margin: 0;
        }

        .user-tag {
          color: #b5bac1;
          font-size: 14px;
          margin: 4px 0;
        }

        .separator {
          height: 1px;
          background: #313338;
          margin: 12px 0;
        }

        .detail-item label {
          font-size: 10px;
          font-weight: bold;
          color: white;
          display: block;
          margin-bottom: 4px;
        }

        .detail-item p {
          color: #dbdee1;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .input-field {
          width: 100%;
          padding: 8px;
          border-radius: 6px;
          border: none;
          outline: none;
          background: #2b2d31;
          color: white;
          margin-bottom: 12px;
          box-sizing: border-box;
        }

        .save-btn {
          width: 100%;
          margin-top: 12px;
          padding: 10px;
          background: #5865f2;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .close-btn {
          width: 100%;
          margin-top: 10px;
          padding: 8px;
          background: #4e5058;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }

      `}</style>
    </div>
  );
}