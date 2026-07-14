



import React, { useState } from "react";

import {
  updateGroupAvatarApi,
  updateGroupNameApi,
} from "../../api/conversationApi";

export default function EditGroupModal({
  conversation,
  onClose,
  onUpdated,
}) {

  const [groupName, setGroupName] =
    useState(conversation?.name || "");

  const [preview, setPreview] =
    useState(
      conversation?.groupAvatar ||
      conversation?.avatar_url ||
      "https://cdn.discordapp.com/embed/avatars/0.png"
    );

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // SELECT AVATAR
  // =====================================================

  const handleSelectFile = (e) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);

    setPreview(
      URL.createObjectURL(file)
    );
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = async () => {

    try {

      setLoading(true);

      let updatedConversation =
        { ...conversation };

      // =========================================
      // UPDATE AVATAR
      // =========================================

      if (selectedFile) {

        console.log(
          "UPLOAD GROUP AVATAR:",
          selectedFile
        );

        // 🔥 Gửi trực tiếp file lên API avatar
        const avatarRes =
          await updateGroupAvatarApi(
            conversation.id,
            selectedFile
          );

        console.log(
          "AVATAR RES:",
          avatarRes
        );

        updatedConversation = {
          ...updatedConversation,
          ...(avatarRes?.data || avatarRes),
        };

        // update preview local
        updatedConversation.groupAvatar =
          avatarRes?.data?.groupAvatar ||
          avatarRes?.groupAvatar ||
          preview;
      }

      // =========================================
      // UPDATE NAME
      // =========================================

      if (
        groupName &&
        groupName.trim() !==
          conversation?.name
      ) {

        const nameRes =
          await updateGroupNameApi(
            conversation.id,
            groupName.trim()
          );

        console.log(
          "NAME RES:",
          nameRes
        );

        updatedConversation = {
          ...updatedConversation,
          ...(nameRes?.data || nameRes),
          name: groupName.trim()
        };
      }

      // =========================================
      // CALLBACK
      // =========================================

      if (onUpdated) {

        onUpdated(
          updatedConversation
        );
      }

      alert(
        "Cập nhật nhóm thành công"
      );

      onClose();

    } catch (err) {

      console.error(err);

      alert(
        err?.message ||
        "Cập nhật thất bại"
      );

    } finally {

      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
    >

      <div
        className="modal-content"
        onClick={(e) =>
          e.stopPropagation()
        }
      >

        <h2>
          Chỉnh sửa nhóm
        </h2>

        {/* ===================== */}
        {/* AVATAR */}
        {/* ===================== */}

        <div
          className="avatar-wrapper"
        >

          <img
            src={preview}
            alt="group"
            className="group-avatar"
          />

          <label
            className="camera-btn"
          >

            📷

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={
                handleSelectFile
              }
            />

          </label>

        </div>

        {/* ===================== */}
        {/* GROUP NAME */}
        {/* ===================== */}

        <input
          className="group-input"
          value={groupName}
          placeholder="Nhập tên nhóm"
          onChange={(e) =>
            setGroupName(
              e.target.value
            )
          }
        />

        {/* ===================== */}
        {/* SAVE */}
        {/* ===================== */}

        <button
          className="save-btn"
          disabled={loading}
          onClick={handleSave}
        >
          {
            loading
              ? "Đang lưu..."
              : "Lưu thay đổi"
          }
        </button>

        {/* ===================== */}
        {/* CLOSE */}
        {/* ===================== */}

        <button
          className="close-btn"
          onClick={onClose}
        >
          Đóng
        </button>

      </div>

      {/* ===================== */}
      {/* STYLE */}
      {/* ===================== */}

      <style>{`

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          width: 360px;
          background: #1e1f22;
          border-radius: 16px;
          padding: 24px;
          color: white;
          box-shadow:
            0 0 30px rgba(0,0,0,0.4);
        }

        .modal-content h2 {
          margin-top: 0;
          margin-bottom: 22px;
          text-align: center;
          font-size: 22px;
        }

        .avatar-wrapper {
          position: relative;
          width: 110px;
          margin: 0 auto 18px;
        }

        .group-avatar {
          width: 110px;
          height: 110px;
          border-radius: 50%;
          object-fit: cover;
          border: 4px solid #5865f2;
          display: block;
        }

        .camera-btn {
          position: absolute;
          right: 0;
          bottom: 0;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #5865f2;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 16px;
          border: 3px solid #1e1f22;
          transition: 0.2s;
        }

        .camera-btn:hover {
          transform: scale(1.08);
          background: #7289ff;
        }

        .group-input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: none;
          outline: none;
          background: #2b2d31;
          color: white;
          margin-bottom: 18px;
          box-sizing: border-box;
          font-size: 15px;
        }

        .save-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #5865f2;
          color: white;
          cursor: pointer;
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 10px;
          transition: 0.2s;
        }

        .save-btn:hover {
          background: #7289ff;
        }

        .save-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .close-btn {
          width: 100%;
          padding: 12px;
          border: none;
          border-radius: 10px;
          background: #4e5058;
          color: white;
          cursor: pointer;
          font-size: 15px;
          transition: 0.2s;
        }

        .close-btn:hover {
          background: #666972;
        }

      `}</style>

    </div>
  );
}