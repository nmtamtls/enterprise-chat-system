

// import React, { useState } from "react";
// import { message } from "antd";
// import { CheckCircleFilled } from "@ant-design/icons";
// import reportApi from "../../api/reportApi"; 

// export default function ReportModal({ visible, onClose, targetId, reportType, currentUserId }) {
//   const [reason, setReason] = useState("SPAM");
//   const [description, setDescription] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);

//   if (!visible) return null;

//   const handleReport = async () => {
//     // 1. Kiểm tra an toàn: Không được tự báo cáo chính mình
//     if (targetId === currentUserId) {
//       message.error("Bạn không thể báo cáo chính mình!");
//       return;
//     }

//     if (!description.trim()) {
//       message.warning("Vui lòng nhập mô tả báo cáo!");
//       return;
//     }

//     setLoading(true);
//     try {
//       // 2. Gọi API gửi báo cáo
//       await reportApi.sendReport({ 
//         targetId, 
//         reportType, 
//         reason, 
//         description 
//       });
      
//       setIsSuccess(true);
//     } catch (err) {
//       console.error("Lỗi gửi báo cáo:", err);
//       // 3. Hiển thị thông báo lỗi chi tiết từ Backend
//       const errorMsg = err.response?.data?.message || "Gửi báo cáo thất bại, vui lòng thử lại.";
//       message.error(errorMsg);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const reportOptions = [
//     { id: "SPAM", label: "Spam tin nhắn" },
//     { id: "HARASSMENT", label: "Quấy rối hoặc bắt nạt" },
//     { id: "HATE_SPEECH", label: "Ngôn từ thù ghét / Phân biệt đối xử" },
//     { id: "INAPPROPRIATE_CONTENT", label: "Nội dung nhạy cảm (18+) / Hình ảnh phản cảm" },
//     { id: "SCAM", label: "Lừa đảo / Giả mạo tài khoản" },
//     { id: "VIOLENCE", label: "Đe dọa bạo lực / Nguy hiểm" },
//     { id: "OTHER", label: "Lý do khác" },
//   ];

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="profile-board" onClick={(e) => e.stopPropagation()}>
//         <div className="banner" style={{ backgroundColor: isSuccess ? "#3ba55d" : "#ed4245" }} />
        
//         <div className="content">
//           <div className="info-box">
//             {isSuccess ? (
//               <div style={{ textAlign: "center", padding: "40px 0" }}>
//                 <CheckCircleFilled style={{ fontSize: "64px", color: "#3ba55d", marginBottom: "20px" }} />
//                 <h2 style={{ color: "white" }}>Đã gửi báo cáo!</h2>
//                 <p style={{ color: "#b5bac1", marginBottom: "30px" }}>Cảm ơn bạn đã đóng góp giúp cộng đồng an toàn hơn.</p>
//                 <button className="save-btn" onClick={onClose} style={{ backgroundColor: "#3ba55d" }}>Đóng</button>
//               </div>
//             ) : (
//               <>
//                 <h3 style={{ marginBottom: "20px", color: "white" }}>Báo cáo vi phạm</h3>
                
//                 <div className="detail-item">
//                   <label>LÝ DO BÁO CÁO</label>
//                   <div className="report-options-container">
//                     {reportOptions.map((option) => (
//                       <div
//                         key={option.id}
//                         className={`report-option ${reason === option.id ? "selected" : ""}`}
//                         onClick={() => setReason(option.id)}
//                       >
//                         {option.label}
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 <div className="detail-item">
//                   <label>MÔ TẢ CHI TIẾT</label>
//                   <textarea
//                     className="input-field"
//                     rows={3}
//                     placeholder="Hãy cho chúng tôi biết chi tiết vi phạm..."
//                     value={description}
//                     onChange={(e) => setDescription(e.target.value)}
//                     style={{ resize: "none" }}
//                   />
//                 </div>

//                 <button className="save-btn" onClick={handleReport} disabled={loading} style={{ backgroundColor: "#ed4245" }}>
//                   {loading ? "Đang gửi..." : "Gửi báo cáo"}
//                 </button>
//                 <button className="close-btn" onClick={onClose}>Hủy</button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999; }
//         .profile-board { width: 450px; background: #111214; border-radius: 10px; overflow: hidden; }
//         .banner { height: 60px; transition: background 0.3s; }
//         .content { padding: 20px; }
//         .info-box { background: #1e1f22; padding: 20px; border-radius: 8px; }
//         .detail-item { margin-bottom: 20px; }
//         .detail-item label { font-size: 11px; font-weight: bold; color: #b5bac1; display: block; margin-bottom: 8px; }
//         .report-options-container { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 5px; }
//         .report-options-container::-webkit-scrollbar { width: 6px; }
//         .report-options-container::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
//         .report-option { background: #2b2d31; padding: 12px; border-radius: 6px; color: #dbdee1; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; font-size: 14px; }
//         .report-option:hover { background: #35373c; color: white; }
//         .report-option.selected { background: #383a40; border-color: #5865f2; color: white; }
//         .input-field { width: 100%; padding: 12px; border-radius: 6px; border: none; background: #2b2d31; color: white; box-sizing: border-box; font-size: 14px; }
//         .save-btn { width: 100%; padding: 12px; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold; font-size: 14px; }
//         .close-btn { width: 100%; padding: 10px; background: transparent; color: #b5bac1; border: none; cursor: pointer; margin-top: 5px; font-size: 14px; }
//         .close-btn:hover { text-decoration: underline; color: white; }
//       `}</style>
//     </div>
//   );
// }




import React, { useState } from "react";
import { message } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import reportApi from "../../api/reportApi";

/**
 * ReportModal: Component hiển thị giao diện báo cáo vi phạm
 * @param {string} targetId - ID của đối tượng bị báo cáo (User hoặc Conversation)
 * @param {string} reportType - "USER", "CONVERSATION", hoặc "MESSAGE"
 * @param {string} messageId - (Optional) ID của tin nhắn cụ thể nếu báo cáo tin nhắn
 */
export default function ReportModal({ visible, onClose, targetId, reportType, messageId, currentUserId }) {
  const [reason, setReason] = useState("SPAM");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!visible) return null;

  const handleReport = async () => {
    // 1. Kiểm tra an toàn: Không được tự báo cáo chính mình (chỉ kiểm tra nếu là báo cáo User)
    if (reportType === "USER" && targetId === currentUserId) {
      message.error("Bạn không thể báo cáo chính mình!");
      return;
    }

    if (!description.trim()) {
      message.warning("Vui lòng nhập mô tả báo cáo!");
      return;
    }

    setLoading(true);
    try {
      // 2. Gọi API gửi báo cáo với đầy đủ payload
      await reportApi.sendReport({
        targetId,
        reportType,
        messageId, // Thêm messageId vào payload
        reason,
        description
      });

      setIsSuccess(true);
    } catch (err) {
      console.error("Lỗi gửi báo cáo:", err);
      const errorMsg = err.response?.data?.message || "Gửi báo cáo thất bại, vui lòng thử lại.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const reportOptions = [
    { id: "SPAM", label: "Spam tin nhắn" },
    { id: "HARASSMENT", label: "Quấy rối hoặc bắt nạt" },
    { id: "HATE_SPEECH", label: "Ngôn từ thù ghét / Phân biệt đối xử" },
    { id: "INAPPROPRIATE_CONTENT", label: "Nội dung nhạy cảm (18+) / Hình ảnh phản cảm" },
    { id: "SCAM", label: "Lừa đảo / Giả mạo tài khoản" },
    { id: "VIOLENCE", label: "Đe dọa bạo lực / Nguy hiểm" },
    { id: "OTHER", label: "Lý do khác" },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="profile-board" onClick={(e) => e.stopPropagation()}>
        <div className="banner" style={{ backgroundColor: isSuccess ? "#3ba55d" : "#ed4245" }} />

        <div className="content">
          <div className="info-box">
            {isSuccess ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <CheckCircleFilled style={{ fontSize: "64px", color: "#3ba55d", marginBottom: "20px" }} />
                <h2 style={{ color: "white" }}>Đã gửi báo cáo!</h2>
                <p style={{ color: "#b5bac1", marginBottom: "30px" }}>Cảm ơn bạn đã đóng góp giúp cộng đồng an toàn hơn.</p>
                <button className="save-btn" onClick={onClose} style={{ backgroundColor: "#3ba55d" }}>Đóng</button>
              </div>
            ) : (
              <>
                <h3 style={{ marginBottom: "20px", color: "white" }}>Báo cáo vi phạm</h3>

                <div className="detail-item">
                  <label>LÝ DO BÁO CÁO</label>
                  <div className="report-options-container">
                    {reportOptions.map((option) => (
                      <div
                        key={option.id}
                        className={`report-option ${reason === option.id ? "selected" : ""}`}
                        onClick={() => setReason(option.id)}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="detail-item">
                  <label>MÔ TẢ CHI TIẾT</label>
                  <textarea
                    className="input-field"
                    rows={3}
                    placeholder="Hãy cho chúng tôi biết chi tiết vi phạm..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: "none" }}
                  />
                </div>

                <button className="save-btn" onClick={handleReport} disabled={loading} style={{ backgroundColor: "#ed4245" }}>
                  {loading ? "Đang gửi..." : "Gửi báo cáo"}
                </button>
                <button className="close-btn" onClick={onClose}>Hủy</button>
              </>
            )}
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; justify-content: center; align-items: center; z-index: 9999; }
        .profile-board { width: 450px; background: #111214; border-radius: 10px; overflow: hidden; }
        .banner { height: 60px; transition: background 0.3s; }
        .content { padding: 20px; }
        .info-box { background: #1e1f22; padding: 20px; border-radius: 8px; }
        .detail-item { margin-bottom: 20px; }
        .detail-item label { font-size: 11px; font-weight: bold; color: #b5bac1; display: block; margin-bottom: 8px; }
        .report-options-container { display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; padding-right: 5px; }
        .report-options-container::-webkit-scrollbar { width: 6px; }
        .report-options-container::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
        .report-option { background: #2b2d31; padding: 12px; border-radius: 6px; color: #dbdee1; cursor: pointer; border: 2px solid transparent; transition: all 0.2s ease; font-size: 14px; }
        .report-option:hover { background: #35373c; color: white; }
        .report-option.selected { background: #383a40; border-color: #5865f2; color: white; }
        .input-field { width: 100%; padding: 12px; border-radius: 6px; border: none; background: #2b2d31; color: white; box-sizing: border-box; font-size: 14px; }
        .save-btn { width: 100%; padding: 12px; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold; font-size: 14px; }
        .close-btn { width: 100%; padding: 10px; background: transparent; color: #b5bac1; border: none; cursor: pointer; margin-top: 5px; font-size: 14px; }
        .close-btn:hover { text-decoration: underline; color: white; }
      `}</style>
    </div>
  );
}