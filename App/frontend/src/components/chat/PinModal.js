
// import React from "react";
// import {
//   Modal,
//   List,
//   Typography,
//   Badge,
//   Empty,
//   Button,
//   ConfigProvider,
//   theme,
//   Avatar,
// } from "antd";
// import {
//   PushpinOutlined,
//   PushpinFilled,
//   ClockCircleOutlined,
//   UserOutlined,
//   PaperClipOutlined,
// } from "@ant-design/icons";

// const { Text } = Typography;

// const PinModal = ({ isOpen, onClose, pinnedMessages = [], onJumpToMessage }) => {
//   const formatDateTime = (timestamp) => {
//     if (!timestamp) return "N/A";
//     const date = new Date(timestamp);
//     return isNaN(date.getTime()) ? "N/A" : date.toLocaleString("vi-VN");
//   };

//   return (
//     <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
//       <Modal
//         open={isOpen}
//         onCancel={onClose}
//         footer={null}
//         width={520}
//         centered
//         title={
//           <div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: 10,
//               color: "#fff",
//               fontWeight: 600,
//               fontSize: 18,
//             }}
//           >
//             <PushpinOutlined style={{ color: "#5865f2", fontSize: 20 }} />
//             Tin nhắn đã ghim
//             <Badge
//               count={pinnedMessages.length}
//               style={{
//                 backgroundColor: "#5865f2",
//                 boxShadow: "none",
//               }}
//             />
//           </div>
//         }
//         styles={{
//           content: {
//             background: "#1e1f22",
//             borderRadius: 18,
//             overflow: "hidden",
//             border: "1px solid #2b2d31",
//             boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
//           },
//           header: {
//             background: "#1e1f22",
//             borderBottom: "1px solid #2b2d31",
//             padding: "18px 24px",
//           },
//           body: {
//             background: "#1e1f22",
//             padding: "20px",
//             maxHeight: "65vh",
//             overflowY: "auto",
//           },
//         }}
//       >
//         <List
//           locale={{
//             emptyText: (
//               <Empty
//                 image={Empty.PRESENTED_IMAGE_SIMPLE}
//                 description={
//                   <span style={{ color: "#949ba4" }}>
//                     Chưa có tin nhắn nào được ghim
//                   </span>
//                 }
//               />
//             ),
//           }}
//           dataSource={pinnedMessages}
//           renderItem={(msg) => (
//             <List.Item
//               onClick={() => {
//                 onJumpToMessage?.(msg.id);
//                 onClose();
//               }}
//               style={{
//                 cursor: "pointer",
//                 padding: 16,
//                 borderRadius: 14,
//                 marginBottom: 12,
//                 background: "#2b2d31",
//                 border: "1px solid #3a3c42",
//                 transition: "all 0.2s ease",
//               }}
//               onMouseOver={(e) => {
//                 e.currentTarget.style.background = "#313338";
//                 e.currentTarget.style.transform = "translateY(-2px)";
//               }}
//               onMouseOut={(e) => {
//                 e.currentTarget.style.background = "#2b2d31";
//                 e.currentTarget.style.transform = "translateY(0)";
//               }}
//             >
//               <List.Item.Meta
//                 avatar={
//                   <Avatar
//                     size={42}
//                     icon={<UserOutlined />}
//                     style={{
//                       backgroundColor: "#5865f2",
//                     }}
//                   />
//                 }
//                 title={
//                   <div
//                     style={{
//                       display: "flex",
//                       justifyContent: "space-between",
//                       alignItems: "center",
//                       marginBottom: 6,
//                     }}
//                   >
//                     <Text strong style={{ color: "#fff", fontSize: 14 }}>
//                       {msg.senderName || "Unknown"}
//                     </Text>

//                     <Text style={{ color: "#949ba4", fontSize: 11 }}>
//                       <ClockCircleOutlined style={{ marginRight: 4 }} />
//                       {formatDateTime(msg.createdAt)}
//                     </Text>
//                   </div>
//                 }
//                 description={
//                   <div>
//                     <div
//                       style={{
//                         color: "#dcddde",
//                         fontSize: 14,
//                         lineHeight: 1.6,
//                         background: "#1e1f22",
//                         padding: "10px 12px",
//                         borderRadius: 10,
//                       }}
//                     >
//                       {msg.content || (
//                         <>
//                           <PaperClipOutlined /> {msg.fileName || "File đính kèm"}
//                         </>
//                       )}
//                     </div>

//                     <div
//                       style={{
//                         marginTop: 10,
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 6,
//                         color: "#5865f2",
//                         fontSize: 11,
//                         fontWeight: 500,
//                       }}
//                     >
//                       <PushpinFilled />
//                       Ghim lúc: {formatDateTime(msg.pinnedAt)}
//                     </div>
//                   </div>
//                 }
//               />
//             </List.Item>
//           )}
//         />

//         <div style={{ marginTop: 16, textAlign: "right" }}>
//           <Button
//             onClick={onClose}
//             style={{
//               background: "#5865f2",
//               border: "none",
//               color: "#fff",
//               fontWeight: 600,
//               borderRadius: 8,
//             }}
//           >
//             Đóng
//           </Button>
//         </div>
//       </Modal>
//     </ConfigProvider>
//   );
// };

// export default PinModal;



import React from "react";
import {
  Modal,
  List,
  Typography,
  Badge,
  Empty,
  Button,
  ConfigProvider,
  theme,
  Avatar,
} from "antd";
import {
  PushpinOutlined,
  PushpinFilled,
  ClockCircleOutlined,
  UserOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

const PinModal = ({ isOpen, onClose, pinnedMessages = [], onJumpToMessage, allUsers = [] }) => {
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return isNaN(date.getTime()) ? "N/A" : date.toLocaleString("vi-VN");
  };

  // Hàm helper để tìm avatar của người gửi
  const getAvatar = (msg) => {
    // Ưu tiên lấy từ thuộc tính avatar có sẵn trong tin nhắn (nếu có)
    if (msg.senderAvatar) return msg.senderAvatar;
    
    // Tìm kiếm trong danh sách allUsers dựa trên tên hoặc ID
    const user = allUsers.find(u => u.username === msg.senderName || u.id === msg.senderId);
    return user?.avatar_url || null;
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Modal
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={520}
        centered
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff", fontWeight: 600, fontSize: 18 }}>
            <PushpinOutlined style={{ color: "#5865f2", fontSize: 20 }} />
            Tin nhắn đã ghim
            <Badge
              count={pinnedMessages.length}
              style={{ backgroundColor: "#5865f2", boxShadow: "none" }}
            />
          </div>
        }
        styles={{
          content: { background: "#1e1f22", borderRadius: 18, overflow: "hidden", border: "1px solid #2b2d31", boxShadow: "0 20px 50px rgba(0,0,0,0.45)" },
          header: { background: "#1e1f22", borderBottom: "1px solid #2b2d31", padding: "18px 24px" },
          body: { background: "#1e1f22", padding: "20px", maxHeight: "65vh", overflowY: "auto" },
        }}
      >
        <List
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<span style={{ color: "#949ba4" }}>Chưa có tin nhắn nào được ghim</span>}
              />
            ),
          }}
          dataSource={pinnedMessages}
          renderItem={(msg) => (
            <List.Item
              onClick={() => { onJumpToMessage?.(msg.id); onClose(); }}
              style={{
                cursor: "pointer", padding: 16, borderRadius: 14, marginBottom: 12,
                background: "#2b2d31", border: "1px solid #3a3c42", transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = "#313338"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseOut={(e) => { e.currentTarget.style.background = "#2b2d31"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={42}
                    src={getAvatar(msg)} // Gọi hàm lấy avatar
                    icon={!getAvatar(msg) ? <UserOutlined /> : null}
                    style={{ backgroundColor: "#5865f2", objectFit: "cover" }}
                  />
                }
                title={
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <Text strong style={{ color: "#fff", fontSize: 14 }}>{msg.senderName || "Unknown"}</Text>
                    <Text style={{ color: "#949ba4", fontSize: 11 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {formatDateTime(msg.createdAt)}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <div style={{ color: "#dcddde", fontSize: 14, lineHeight: 1.6, background: "#1e1f22", padding: "10px 12px", borderRadius: 10 }}>
                      {msg.content || <><PaperClipOutlined /> {msg.fileName || "File đính kèm"}</>}
                    </div>
                    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6, color: "#5865f2", fontSize: 11, fontWeight: 500 }}>
                      <PushpinFilled /> Ghim lúc: {formatDateTime(msg.pinnedAt)}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button
            onClick={onClose}
            style={{ background: "#5865f2", border: "none", color: "#fff", fontWeight: 600, borderRadius: 8 }}
          >
            Đóng
          </Button>
        </div>
      </Modal>
    </ConfigProvider>
  );
};

export default PinModal;