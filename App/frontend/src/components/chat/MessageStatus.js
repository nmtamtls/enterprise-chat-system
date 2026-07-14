import React from "react";
// Sử dụng react-icons (nhớ cài: npm install react-icons)
import { IoCheckmark, IoCheckmarkDone } from "react-icons/io5"; 

const MessageStatus = ({ status }) => {
  // CSS chung cho icon
  const iconStyle = {
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    marginLeft: "2px"
  };

  switch (status) {
    case "sent":
      // Một tích xám - Đã gửi
      return <IoCheckmark style={{ ...iconStyle, color: "#0c2d5c" }} />;
    
    case "delivered":
      // Hai tích xám - Đã tới máy người nhận
      return <IoCheckmarkDone style={{ ...iconStyle, color: "#ff0000" }} />;
    
    case "read":
      // Hai tích màu xanh - Đã đọc
      return <IoCheckmarkDone style={{ ...iconStyle, color: "#00ddff" }} />;
    
    default:
      // Nếu trạng thái lạ, không hiển thị gì để tránh lỗi giao diện
      return null;
  }
};

export default MessageStatus;