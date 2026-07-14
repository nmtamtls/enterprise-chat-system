import React from "react";

export default function ProfileCard({ user, isOnline, onBack }) {
  return (
    <div className="user-profile-card">
      <div className="profile-banner" style={{ background: user.role === "ADMIN" ? "#ed4245" : "#5865f2" }} />
      <div className="profile-body">
        <div className="profile-avatar-wrapper">
          <img src={user.avatar_url} className="profile-avatar" alt="avatar" />
          <div className={`profile-status-dot ${isOnline ? "online" : "offline"}`} />
        </div>
        <h3 className="profile-name">{user.full_name}</h3>
        <p className="profile-username">@{user.username}</p>
        <hr className="profile-divider" />
        <div className="profile-detail-section">
          <div className="detail-item">
            <label>EMAIL</label>
            <span>{user.email || "Không có email"}</span>
          </div>
          <div className="detail-item">
            <label>VAI TRÒ</label>
            <span className={user.role === "ADMIN" ? "role-admin" : ""}>{user.role || "USER"}</span>
          </div>
        </div>
        <button className="profile-back-btn" onClick={onBack}>Quay lại</button>
      </div>
    </div>
  );
}
