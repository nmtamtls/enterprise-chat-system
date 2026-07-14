// import React, { useState, useEffect } from 'react';
// import styles from '../../styles/KeyManagementModal.module.css';

// const KeyManagementModal = ({ isOpen, onClose, onSaveKey, conversationId }) => {
//     const [keyInput, setKeyInput] = useState('');
//     const [currentKey, setCurrentKey] = useState('');

//     // Load key hiện tại từ localStorage mỗi khi mở modal
//     useEffect(() => {
//         if (isOpen) {
//             const savedKey = localStorage.getItem(`file-key-${conversationId}`);
//             setCurrentKey(savedKey || 'Chưa có khóa');
//         }
//     }, [isOpen, conversationId]);

//     const handleCopy = () => {
//         if (currentKey && currentKey !== 'Chưa có khóa') {
//             navigator.clipboard.writeText(currentKey);
//             alert("Đã sao chép khóa!");
//         }
//     };

//     const handleSave = () => {
//         if (keyInput.trim()) {
//             onSaveKey(keyInput);
//             setKeyInput('');
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className={styles.modalOverlay}>
//             <div className={styles.modalContent}>
//                 <h3>🔑 Quản lý khóa giải mã</h3>
                
//                 {/* Phần hiển thị khóa hiện tại */}
//                 <div style={{ margin: '10px 0', padding: '10px', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #eee' }}>
//                     <p style={{ fontSize: '12px', color: '#666', margin: '0 0 5px 0' }}>Khóa hiện tại:</p>
//                     <code style={{ fontSize: '13px', wordBreak: 'break-all', color: '#333' }}>{currentKey}</code>
//                     <button 
//                         onClick={handleCopy}
//                         style={{ display: 'block', marginTop: '5px', fontSize: '12px', cursor: 'pointer' }}
//                     >
//                         Sao chép khóa
//                     </button>
//                 </div>

//                 {/* Phần nhập khóa mới */}
//                 <input 
//                     type="text"
//                     value={keyInput} 
//                     onChange={(e) => setKeyInput(e.target.value)}
//                     placeholder="Dán mã khóa mới để thay đổi..."
//                 />
                
//                 <div className={styles.buttonGroup}>
//                     <button className={styles.closeBtn} onClick={onClose}>Đóng</button>
//                     <button className={styles.saveBtn} onClick={handleSave}>Lưu khóa</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default KeyManagementModal;

import React, { useState, useEffect } from 'react';
import styles from '../../styles/KeyManagementModal.module.css';

const KeyManagementModal = ({ isOpen, onClose, onSaveKey, conversationId, isKeySynced }) => {
    const [keyInput, setKeyInput] = useState('');
    const [currentKey, setCurrentKey] = useState('');

    useEffect(() => {
        if (isOpen) {
            const savedKey = localStorage.getItem(`file-key-${conversationId}`);
            setCurrentKey(savedKey || 'Chưa có khóa');
        }
    }, [isOpen, conversationId]);

    const handleSave = () => {
        const newKey = keyInput.trim();
        if (newKey) {
            localStorage.setItem(`file-key-${conversationId}`, newKey);
            setCurrentKey(newKey);
            if (onSaveKey) {
                onSaveKey(newKey);
            }
            setKeyInput('');
            alert("Khóa đã được cập nhật thành công!");
            onClose(); // Đóng modal sau khi lưu
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <h3>🔑 Quản lý khóa giải mã</h3>
                
                {/* Phần hiển thị khóa hiện tại */}
                <div className={styles.fingerprintBox}>
                    <p>Khóa hiện tại (File Key):</p>
                    <code>{currentKey}</code>
                </div>

                {/* 🔥 LOGIC MỚI: Chỉ hiển thị phần nhập khóa nếu CHƯA ĐỒNG BỘ */}
                {isKeySynced ? (
                    <div className={styles.successBox}>
                        <p style={{ color: 'green', fontWeight: 'bold' }}>
                            ✅ Bạn và đối phương đang sử dụng cùng một khóa.
                        </p>
                    </div>
                ) : (
                    <>
                        <input 
                            type="text"
                            value={keyInput} 
                            onChange={(e) => setKeyInput(e.target.value)}
                            placeholder="Dán mã khóa mới để thay đổi..."
                        />
                        <div className={styles.buttonGroup}>
                            <button className={styles.closeBtn} onClick={onClose}>Đóng</button>
                            <button className={styles.saveBtn} onClick={handleSave}>Lưu khóa</button>
                        </div>
                    </>
                )}
                
                {/* Luôn hiển thị nút Đóng nếu đã đồng bộ */}
                {isKeySynced && (
                    <div className={styles.buttonGroup}>
                        <button className={styles.closeBtn} onClick={onClose}>Đóng</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KeyManagementModal;