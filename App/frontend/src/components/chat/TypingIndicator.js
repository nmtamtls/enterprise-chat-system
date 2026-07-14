import React from 'react';

const TypingIndicator = ({ typingUsers, currentUserId, conversation, messages }) => {
    // --- PHẦN LOGIC XỬ LÝ DỮ LIỆU (Giữ nguyên) ---
    const typingIds = Object.entries(typingUsers || {}).filter(([userId, status]) => {
        const isActuallyTyping = typeof status === 'object' ? status.isTyping : status;
        return isActuallyTyping === true && String(userId) !== String(currentUserId);
    }).map(([userId]) => userId);

    if (typingIds.length === 0) return null;

    const members = conversation?.participants || [];
    const typingNames = typingIds.map(id => {
        const member = members.find(m => String(m.id || m._id) === String(id));
        if (member) return member.fullName || member.full_name || member.username;
        const lastMsgFromUser = [...(messages || [])].reverse().find(m => String(m.senderId) === String(id));
        return lastMsgFromUser?.senderName || "Thành viên";
    });

    const uniqueNames = [...new Set(typingNames)].filter(Boolean);
    if (uniqueNames.length === 0) return null;

   // Tách riêng nội dung chữ
    const TypingContent = () => {
        const count = uniqueNames.length;
        // Chữ được bọc trong span với màu trắng rõ nét (100%)
        const textStyle = { color: '#ffffff', fontWeight: '500' };
        
        if (count === 1) return <><span style={textStyle}>{uniqueNames[0]}</span> đang nhập...</>;
        if (count === 2) return <><span style={textStyle}>{uniqueNames[0]}</span> và <span style={textStyle}>{uniqueNames[1]}</span> đang nhập...</>;
        return <><span style={textStyle}>{uniqueNames[0]}</span> và {count - 1} người khác đang nhập...</>;
    };

    // Tách riêng khung: Dùng rgba để tạo độ mờ cho nền mà không ảnh hưởng đến chữ
    const containerStyle = {
        position: 'fixed',
        bottom: '80px',
        // Dùng rgba cho nền: 0.3 là độ mờ, chữ bên trong sẽ không bị mờ theo
        backgroundColor: 'rgba(0, 0, 0, 0.1)', 
        borderRadius: '20px',
        fontSize: '0.82rem',
        color: '#dbdee1', // Màu chữ mặc định
        display: 'flex',
        alignItems: 'center',
        
    };

    return (
        <div style={containerStyle}>
            <div style={{ marginRight: '8px', fontWeight: 'bold', color: '#ffffff' }}>
                <span className="dot">.</span><span className="dot">.</span><span className="dot">.</span>
            </div>

            <div className="typing-text">
                <TypingContent />
            </div>

            <style>{`
                @keyframes blink { 0% { opacity: 0.2; } 20% { opacity: 1; } 100% { opacity: 0.2; } }
                .dot { animation: blink 1.4s infinite both; }
                .dot:nth-child(2) { animation-delay: 0.2s; }
                .dot:nth-child(3) { animation-delay: 0.4s; }
            `}</style>
        </div>
    );
};

export default TypingIndicator;