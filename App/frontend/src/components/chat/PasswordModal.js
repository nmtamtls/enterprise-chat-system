import React, { useState } from 'react';

const PasswordModal = ({ isOpen, onClose, onConfirm, title }) => {
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h3>{title || "Nhập mật khẩu"}</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu bảo mật..."
          style={styles.input}
        />
        <div style={styles.actions}>
          <button onClick={onClose} style={styles.cancelBtn}>Hủy</button>
          <button onClick={() => { onConfirm(password); setPassword(""); }} style={styles.confirmBtn}>
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};

// CSS đơn giản cho Modal
const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: '#36393f', padding: '20px', borderRadius: '8px', color: 'white', width: '300px' },
  input: { width: '100%', padding: '10px', marginTop: '10px', boxSizing: 'border-box' },
  actions: { display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' },
  confirmBtn: { backgroundColor: '#5865f2', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' },
  cancelBtn: { backgroundColor: '#4f545c', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }
};

export default PasswordModal;