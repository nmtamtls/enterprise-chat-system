

// src/pages/chat/ChatStyles.js
export const styles = {
  chatContainer: { display: "flex", flexDirection: "column", height: "100%", background: "#1a1a1e" },
  chatHeader: { height: 50, padding: "0 16px", display: "flex", alignItems: "center", borderBottom: "1px solid #26272d" },
  headerTitle: { color: "white", fontSize: "16px", margin: 0 },
  messageList: { flex: 1, overflowY: "auto", padding: "16px" },
  messageRow: (me) => ({ 
    display: "flex", 
    justifyContent: me ? "flex-end" : "flex-start", 
    marginBottom: 16, 
    gap: 8,
    alignItems: "flex-end" 
  }),

  // 🔥 Bổ sung để hỗ trợ chấm Online
  avatarWrap: { position: "relative", display: "flex", alignItems: "flex-end" },
  avatar: { width: 36, height: 36, borderRadius: "50%", objectFit: "cover" },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: "#23a55a",
    borderRadius: "50%",
    border: "2px solid #313338",
  },

  // bubble: (me) => ({
  //   background: me ? "#5865f2" : "#3f4147",
  //   padding: "10px 14px",
  //   borderRadius: me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
  //   color: "white",
  //   maxWidth: "70%",
  //   boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  // }),

  bubble: (me) => ({
    background: me ? "#5865f2" : "#3f4147",
    padding: "10px 14px",
    borderRadius: me ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
    color: "white",
    maxWidth: "70%",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    position: "relative", // QUAN TRỌNG: Để reaction container neo vào bong bóng
    marginBottom: "10px"  // Thêm khoảng cách để không bị đè vào tin nhắn sau
  }),
// Thêm vào trong styles trong file ChatStyles.js
reactionsContainer: (me) => ({
  position: "absolute",
  bottom: "-12px",
  // Căn lề trái nếu là tin nhắn của mình, lề phải nếu là tin nhắn người khác
  [me ? "left" : "right"]: "10px", 
  display: "flex",
  gap: "4px", // Tăng gap để các emoji không dính vào nhau
  padding: "2px 6px",
  backgroundColor: "#2b2d31",
  borderRadius: "12px",
  border: "1px solid #111214",
  zIndex: 10,
  fontSize: "14px", // Tăng cỡ chữ để emoji hiển thị rõ
  cursor: "pointer",
  minHeight: "20px", // Đảm bảo container luôn có chiều cao
  alignItems: "center"
}),

  imagePreview: { maxWidth: "100%", borderRadius: "8px", cursor: "pointer", marginTop: 4 },
  videoPreview: { maxWidth: "100%", borderRadius: "8px", marginTop: 4 }, // Bổ sung cho video
  
  fileBox: { background: "rgba(0,0,0,0.2)", padding: 10, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8, minWidth: 150 },
  fileInfo: { display: "flex", alignItems: "center", gap: 10 },
  fileTextGroup: { display: "flex", flexDirection: "column", overflow: "hidden" },
  fileNameText: { fontSize: 13, fontWeight: "500", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  fileSizeText: { fontSize: 11, opacity: 0.7 },
  downloadLink: { color: "#00a8fc", fontSize: 12, textDecoration: "none", fontWeight: "bold" },

  // 🔥 Đã sửa thành Function để hết lỗi "is not a function"
  timestamp: (me) => ({ 
    fontSize: 10, 
    opacity: 0.5, 
    textAlign: me ? "right" : "left", 
    marginTop: 4 
  }),

  inputArea: { padding: "0px 16px 10px" },
  inputWrapper: { display: "flex", background: "#383a40", borderRadius: "8px", alignItems: "center", padding: "10px 10px" },
  actionBtn: { background: "none", border: "none", color: "#b5bac1", fontSize: 24, cursor: "pointer" },
  textInput: { flex: 1, background: "none", border: "none", color: "white", padding: 12, outline: "none" },
  sendBtn: { background: "none", border: "none", color: "#5865f2", fontSize: 20, cursor: "pointer" },
  filePreviewBar: { background: "#2b2d31", color: "#dbdee1", padding: "4px 12px", fontSize: 12, borderRadius: "8px 8px 0 0", display: "flex", justifyContent: "space-between" },
  cancelFile: { background: "none", border: "none", color: "#f23f42", cursor: "pointer", fontWeight: "bold" }
};