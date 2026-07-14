import React, { useState, useRef, useEffect, useCallback } from "react";
import {CameraOutlined,
  PaperClipOutlined, 
  SafetyCertificateOutlined, 
  SendOutlined, 
  EllipsisOutlined } from '@ant-design/icons';
  import EmojiPicker from 'emoji-picker-react'; // Thêm dòng này
import {SmileOutlined } from '@ant-design/icons';
import { useChat } from "../../hooks/useChat";
import {
  pinMessageApi,
  unpinMessageApi,
  getPinnedMessagesApi
} from "../../api/messageApi";
import { formatFileSize } from "../../utils/formatFile";
import MessageItem from "./MessageItem";
import TypingIndicator from "../../components/chat/TypingIndicator";
import { styles } from "./ChatStyles";
import KeyManagementModal from '../../components/chat/KeyManagementModal';
import { exportKey, deriveKeyFromPassword } from '../../utils/cryptoFile';
import { Tooltip } from 'antd';

// import { updateGroupAvatarApi } from "../../api/conversationApi";
import EditGroupModal from "../../components/chat/EditGroupModal";
// import PinModal from '../../components/chat/PinModal'; // Điều chỉnh đường dẫn phù hợp

const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return isToday
    ? `${hours}:${minutes}`
    : `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")} ${hours}:${minutes}`;
};

const formatChatContent = (content) => {
  if (!content) return "";
  if (typeof content === "string" && content.includes("|||")) {
    return content.split("|||")[1];
  }
  return content;
};


export default function ChatPage({
  selectedConversation,
  setSelectedConversation,
  currentUser,
  token,
  isBlocked,
  isNotConnected,
  isPendingConnection,
  incomingRequest,
  handleAcceptFriend,
  chatSearchQuery,
}) {
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null); // 🔥 BỔ SUNG
  const scrollContainerRef = useRef(null);
  const [isKeyModalOpen, setKeyModalOpen] = useState(false);
  const [editGroupModal, setEditGroupModal] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeMsgForReaction, setActiveMsgForReaction] = useState(null);

  // Thêm vào trong component ChatPage
const [showMentionList, setShowMentionList] = useState(false);
const [mentionList, setMentionList] = useState([]);
const [mentionQuery, setMentionQuery] = useState("");
const [activeIndex, setActiveIndex] = useState(0); // Để chọn bằng phím mũi tên
 
  // const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  

  const handleScroll = () => {
  const container = scrollContainerRef.current;
  if (!container) return;
  
  // Tính khoảng cách từ đáy
  const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
  if (isAtBottom) {

  }};


  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    message: null,
  });
  const openKeyModal = () => setKeyModalOpen(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editInput, setEditInput] = useState("");



  

  const {
    messages,
    setMessages,
    sendMessage,
    sendReaction,
    onlineUsers,
    typingUsers,
    sendTypingStatus,
    sendReadStatus,
    sendDeliveredStatus,
    editMessage,
    recallMessage,
    replyMessage,
    setConversations,
  } = useChat(selectedConversation, currentUser, token);


  // Trong ChatPage.js
const searchResults = messages.filter(msg => 
  chatSearchQuery && 
  (msg.content || msg.message || "").toLowerCase().includes(chatSearchQuery.toLowerCase())
);

// Sau đó ở phần return, bạn hiển thị danh sách này
chatSearchQuery && searchResults.length > 0 && (
  <div style={{ backgroundColor: "#2b2d31", padding: "10px", borderBottom: "1px solid #3f4147" }}>
    <div style={{ color: "#fff", marginBottom: "5px" }}>Kết quả tìm kiếm ({searchResults.length}):</div>
    {searchResults.map(msg => (
      <div 
        key={msg.id} 
        onClick={() => handleJumpToMessage(msg.id)} // Hàm cuộn tới vị trí
        style={{ cursor: "pointer", color: "#00a8fc", padding: "5px 0" }}
      >
        {msg.content?.substring(0, 30)}...
      </div>
    ))}
  </div>
)

const [searchPage, setSearchPage] = useState(1);
const SEARCH_LIMIT = 10; // Mỗi trang 10 tin nhắn
const paginatedResults = searchResults.slice(0, searchPage * SEARCH_LIMIT);


const handleJumpToMessage = (messageId) => {
  // 1. Tìm phần tử trong DOM dựa trên id (bạn cần đảm bảo đã đặt id cho thẻ bao tin nhắn)
  const element = document.getElementById(`msg-${messageId}`);
  
  if (element) {
    // 2. Cuộn tới phần tử đó
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // 3. Hiệu ứng làm nổi bật (Highlight)
    element.style.transition = "background-color 0.8s ease";
    element.style.backgroundColor = "rgba(114, 137, 218, 0.4)";
    
    setTimeout(() => {
      element.style.backgroundColor = "transparent";
    }, 1500);
  }
};

const handleReplyClick = (messageId) => {
  const element = document.getElementById(`msg-${messageId}`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    
    // Tạo hiệu ứng highlight nhẹ để người dùng dễ nhìn thấy tin nhắn gốc
    element.style.transition = "background-color 0.8s ease";
    element.style.backgroundColor = "rgba(114, 137, 218, 0.2)";
    setTimeout(() => {
      element.style.backgroundColor = "transparent";
    }, 1000);
  } else {
    console.warn(`Không tìm thấy tin nhắn với ID: msg-${messageId}`);
  }
};

useEffect(() => {
  setSearchPage(1);
}, [chatSearchQuery]);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const menuRef = useRef(null);

  const prevConversationIdRef = useRef(selectedConversation?.id);
  const prevMessagesCountRef = useRef(messages?.length || 0);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const discordStyles = (
    <style>
      {`
        .discord-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .discord-scrollbar::-webkit-scrollbar-track { background-color: transparent; }
        .discord-scrollbar::-webkit-scrollbar-thumb { background-color: #1a1b1e; border-radius: 10px; border: 2px solid transparent; }
        .discord-scrollbar:hover::-webkit-scrollbar-thumb { background-color: #a1a3a7; }
        .discord-scrollbar { scrollbar-width: thin; scrollbar-color: #1a1b1e transparent; }
        .message-row-container { position: relative; transition: background-color 0.1s ease; }
        .message-row-container:hover { background-color: rgba(78, 80, 88, 0.08) !important; }
        .message-action-btn { width: 28px; height: 28px; min-width: 28px; border-radius: 50%; border: none; background-color: #ebedef; color: #65676b; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: all 0.15s ease; }
        .message-row-container:hover .message-action-btn { opacity: 1; }
        .message-action-btn:hover { background-color: #d8dadf; }
        .context-menu-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; color: #b5bac1; font-size: 14px; cursor: pointer; border-radius: 2px; margin: 2px 0; }
        .context-menu-item:hover { background-color: #4752c4; color: #ffffff; }
        .context-menu-item.danger:hover { background-color: #da373c; }
      `}
    </style>
  );

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, message: null });
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const currentCount = messages?.length || 0;
    const isRoomChanged =
      selectedConversation?.id !== prevConversationIdRef.current;

    if (isRoomChanged) {
      scrollRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    } else if (
      currentCount > prevMessagesCountRef.current ||
      typingUsers?.length > 0
    ) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }

    prevConversationIdRef.current = selectedConversation?.id;
    prevMessagesCountRef.current = currentCount;
  }, [selectedConversation?.id, messages, typingUsers]);

  // ----------------------------------

  const handleOpenMenu = (e, msg) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX - 120,
      y: e.clientY,
      message: msg,
    });
  };

  const startEdit = (msg) => {
    setEditingMessageId(msg.id);
    const rawContent = msg.content || msg.message || "";
    setEditInput(formatChatContent(rawContent));
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleSaveEdit = async (msgId) => {
    if (!editInput.trim()) return;
    const currentSenderId = currentUser?.id;
    if (!currentSenderId) {
      alert("Lỗi xác thực người dùng.");
      return;
    }
    try {
      if (typeof editMessage === "function") {
        await editMessage(msgId, editInput.trim(), currentSenderId);
      }
      setEditingMessageId(null);
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };

  const handleRecall = async (msgId) => {
    try {
      if (typeof recallMessage === "function") {
        await recallMessage(msgId);
      }
      setContextMenu({ visible: false, x: 0, y: 0, message: null });
    } catch (err) {
      console.error("Lỗi:", err);
    }
  };
// const togglePin = async (msg) => {
//     try {
//       if (msg.isPinned) {
//         await unpinMessageApi(msg.id);
//       } else {
//         await pinMessageApi(msg.id);
//       }
//       // Sau khi ghim/bỏ ghim, load lại danh sách tin nhắn ghim để cập nhật UI
//       const res = await getPinnedMessagesApi(selectedConversation.id);
//       if (res.success) {
//         setPinnedMessages(res.data || []);
//       }
//     } catch (err) {
//       console.error("Lỗi khi toggle pin:", err);
//     }
//   };


const togglePin = async (msg) => {
  try {
    const isCurrentlyPinned = msg.isPinned;

    // =========================================
    // CALL API
    // =========================================
    if (isCurrentlyPinned) {
      await unpinMessageApi(msg.id);
    } else {
      await pinMessageApi(msg.id);
    }

    // =========================================
    // UPDATE MESSAGE LIST
    // =========================================
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id
          ? {
              ...m,
              isPinned: !isCurrentlyPinned,
            }
          : m
      )
    );

    // =========================================
    // UPDATE PINNED LIST LOCAL NGAY LẬP TỨC
    // =========================================
    let updatedPinnedList = [];
if (isCurrentlyPinned) {
  updatedPinnedList =
    pinnedMessages.filter(
      (m) => m.id !== msg.id
    );
} else {
  updatedPinnedList = [
    ...pinnedMessages,
    {
      ...msg,
      isPinned: true,
    },
  ];
}

setPinnedMessages(updatedPinnedList);

    // =========================================
    // DATA CHUNG
    // =========================================
    const hasPinned =
      updatedPinnedList.length > 0;

    const latestPinned =
      updatedPinnedList[
        updatedPinnedList.length - 1
      ] || null;

    // =========================================
    // UPDATE selectedConversation
    // =========================================
    if (
      typeof setSelectedConversation ===
      "function"
    ) {
      setSelectedConversation((prev) => ({
        ...prev,
        hasPinnedMessages: hasPinned,
        pinnedCount:
          updatedPinnedList.length,
        latestPinnedMessage:
          latestPinned,
      }));
    }

    // =========================================
    // UPDATE HOME.JS SIDEBAR
    // =========================================
    if (
      typeof setConversations ===
      "function"
    ) {
      setConversations((prev) =>
        prev.map((conv) =>
          String(conv.id) ===
          String(selectedConversation.id)
            ? {
                ...conv,
                hasPinnedMessages:
                  hasPinned,
                pinnedCount:
                  updatedPinnedList.length,
                latestPinnedMessage:
                  latestPinned,
              }
            : conv
        )
      );
    }

    // =========================================
    // OPTIONAL:
    // SYNC LẠI TỪ SERVER
    // =========================================
    const res =
      await getPinnedMessagesApi(
        selectedConversation.id
      );

    if (res.success) {
      setPinnedMessages(res.data || []);
    }
  } catch (err) {
    console.error(
      "Lỗi khi toggle pin:",
      err
    );
  }
};

useEffect(() => {
  if (!selectedConversation?.id) return;

  const hasPinned =
    pinnedMessages.length > 0;

  const latestPinned =
    pinnedMessages[
      pinnedMessages.length - 1
    ] || null;

  // UPDATE selectedConversation
  if (
    typeof setSelectedConversation ===
    "function"
  ) {
    setSelectedConversation((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        hasPinnedMessages:
          hasPinned,

        pinnedCount:
          pinnedMessages.length,

        latestPinnedMessage:
          latestPinned,
      };
    });
  }

  // UPDATE sidebar conversations
  if (
    typeof setConversations ===
    "function"
  ) {
    setConversations((prev) =>
      prev.map((conv) =>
        String(conv.id) ===
        String(
          selectedConversation.id
        )
          ? {
              ...conv,
              hasPinnedMessages:
                hasPinned,

              pinnedCount:
                pinnedMessages.length,

              latestPinnedMessage:
                latestPinned,
            }
          : conv
      )
    );
  }
}, [
  pinnedMessages,
  selectedConversation?.id,
  setConversations,
  setSelectedConversation,
]);

  const updateMessageStatus = useCallback(() => {
    if (!messages?.length) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg || lastMsg.senderId === currentUser?.id) return;
    if (lastMsg.status !== "delivered" && lastMsg.status !== "read") {
      sendDeliveredStatus?.(lastMsg.id, selectedConversation?.id);
    }
    if (document.hasFocus() && lastMsg.status !== "read") {
      sendReadStatus?.(selectedConversation?.id);
    }
  }, [
    messages,
    currentUser?.id,
    selectedConversation?.id,
    sendDeliveredStatus,
    sendReadStatus,
  ]);

  useEffect(() => {
    updateMessageStatus();
    window.addEventListener("focus", updateMessageStatus);
    return () => window.removeEventListener("focus", updateMessageStatus);
  }, [updateMessageStatus]);

  const handleInputFocus = () => {
    if (!messages?.length) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.senderId !== currentUser?.id && lastMsg.status !== "read") {
      sendReadStatus?.(selectedConversation?.id);
    }
  };

  // const handleInputChange = (e) => {
  //   setMessageInput(e.target.value);
  //   if (isBlocked) return;
  //   sendTypingStatus(true);
  //   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  //   typingTimeoutRef.current = setTimeout(() => {
  //     sendTypingStatus(false);
  //   }, 5000);
  // };


  // const handleSend = async (e) => {
  //   e.preventDefault();
    
  //   // Kiểm tra nếu không có nội dung văn bản và không có file
  //   if (!messageInput.trim() && !selectedFile) return;
    
  //   sendTypingStatus(false);
    
  //   try {
  //     if (replyingToMessage) {
  //       // --- TRƯỜNG HỢP TRẢ LỜI TIN NHẮN (REPLY) ---
  //       // Gọi hàm reply từ useChat hook
  //       await replyMessage(replyingToMessage.id, messageInput.trim());
        
  //       // Reset trạng thái sau khi gửi thành công
  //       setReplyingToMessage(null);
  //     } else {
  //       // --- TRƯỜNG HỢP GỬI TIN NHẮN THƯỜNG ---
  //       await sendMessage(messageInput.trim(), selectedFile);
  //     }
      
  //     // Dọn dẹp sau khi gửi
  //     setMessageInput("");
  //     setSelectedFile(null);
  //     if (fileInputRef.current) fileInputRef.current.value = "";
      
  //   } catch (err) {
  //     console.error("Lỗi khi gửi tin nhắn:", err);
  //     // Bạn có thể thêm hiển thị thông báo lỗi (toast/alert) tại đây
  //   }
  // };

// const handleInputChange = (e) => {
//   const value = e.target.value;
//   setMessageInput(value);

//   // 1. Typing Indicator
//   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//   typingTimeoutRef.current = setTimeout(() => {
//     console.log("Đang soạn tin nhắn..."); 
//   }, 500);

//   // 2. Logic @mention
//   const words = value.split(' ');
//   const lastWord = words[words.length - 1];

//   if (lastWord.startsWith('@')) {
//     const query = lastWord.slice(1);
//     setMentionQuery(query); 
    
//     // Sử dụng memberNames (mảng chuỗi) thay vì participants (mảng rỗng)
//     const sourceList = selectedConversation?.memberNames || [];
    
//     // Lọc và format dữ liệu về dạng { id, full_name }
//     const filteredList = sourceList
//       .filter(name => name.toLowerCase().includes(query.toLowerCase()))
//       .map((name, index) => ({
//         id: index, // Dùng tạm index làm id
//         full_name: name
//       }));
    
//     setMentionList(filteredList);
//     setShowMentionList(filteredList.length > 0);
//   } else {
//     setShowMentionList(false);
//     setMentionQuery(""); 
//   }
// };

// const handleInputChange = (e) => {
//   const value = e.target.value;
//   setMessageInput(value);

//   // 1. Typing Indicator
//   if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
//   typingTimeoutRef.current = setTimeout(() => {
//     console.log("Đang soạn tin nhắn..."); 
//   }, 500);

//   // 2. Logic @mention (Chỉ áp dụng khi là nhóm và là cuộc hội thoại nhóm)
//   if (selectedConversation?.isGroup) {
//     const words = value.split(' ');
//     const lastWord = words[words.length - 1];

//     if (lastWord.startsWith('@')) {
//       const query = lastWord.slice(1);
//       setMentionQuery(query); 
      
//       // Sử dụng memberNames (mảng chuỗi) từ selectedConversation
//       const sourceList = selectedConversation?.memberNames || [];
      
//       // Lọc và format dữ liệu về dạng { id, full_name }
//       const filteredList = sourceList
//         .filter(name => name.toLowerCase().includes(query.toLowerCase()))
//         .map((name, index) => ({
//           id: index, 
//           full_name: name
//         }));
      
//       setMentionList(filteredList);
//       setShowMentionList(filteredList.length > 0);
//     } else {
//       setShowMentionList(false);
//       setMentionQuery(""); 
//     }
//   } else {
//     // Nếu không phải nhóm, luôn đóng danh sách mention
//     setShowMentionList(false);
//   }
// };

const handleInputChange = (e) => {
  const value = e.target.value;
  setMessageInput(value);

  // 1. Typing Indicator & Block Check
  if (!isBlocked) {
    sendTypingStatus(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 5000);
  }

  // 2. Logic @mention (Chỉ áp dụng khi là nhóm)
  if (selectedConversation?.isGroup) {
    const words = value.split(' ');
    const lastWord = words[words.length - 1];

    if (lastWord.startsWith('@')) {
      const query = lastWord.slice(1);
      setMentionQuery(query);
      
      // Lấy danh sách thành viên từ conversation
      const sourceList = selectedConversation?.memberNames || [];
      
      const filteredList = sourceList
        .filter(name => name.toLowerCase().includes(query.toLowerCase()))
        .map((name, index) => ({
          id: index,
          full_name: name
        }));
      
      setMentionList(filteredList);
      setShowMentionList(filteredList.length > 0);
    } else {
      setShowMentionList(false);
      setMentionQuery("");
    }
  } else {
    // Không phải nhóm: ẩn danh sách tag
    setShowMentionList(false);
  }
};

  const handleSend = async (e) => {
  e.preventDefault();

  // 1. Kiểm tra an toàn: Đảm bảo đã chọn hội thoại trước khi gửi
  if (!selectedConversation || !selectedConversation.id) {
    console.warn("Chưa chọn cuộc hội thoại nào.");
    alert("Vui lòng chọn một cuộc trò chuyện trước khi gửi tin nhắn.");
    return;
  }

  // 2. Kiểm tra nội dung: Nếu không có nội dung văn bản và không có file thì dừng
  if (!messageInput.trim() && !selectedFile) return;

  sendTypingStatus(false);

  try {
    if (replyingToMessage) {
      // --- TRƯỜNG HỢP TRẢ LỜI TIN NHẮN (REPLY) ---
      await replyMessage(replyingToMessage.id, messageInput.trim());
      setReplyingToMessage(null);
    } else {
      // --- TRƯỜNG HỢP GỬI TIN NHẮN THƯỜNG ---
      // sendMessage lúc này đã được bảo vệ bởi check null trong hook useChat
      await sendMessage(messageInput.trim(), selectedFile);
    }

    // 3. Dọn dẹp giao diện sau khi gửi thành công
    setMessageInput("");
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

  } catch (err) {
    console.error("Lỗi khi gửi tin nhắn:", err);
    // Nếu lỗi là do chưa thiết lập khóa (từ throw new Error trong useChat), 
    // hàm sendMessage đã tự hiển thị alert, bạn không cần xử lý thêm nếu không muốn.
  }
};
// ================= BỔ SUNG: PIN MESSAGE =================
// Thêm hàm này vào ChatPage để xử lý khi click vào tên
const handleSelectMention = (member) => {
  const words = messageInput.split(' ');
  words.pop(); // Xóa từ cuối đang gõ (ví dụ "@nguy")
  
  // Thay thế bằng tên đầy đủ
  const newValue = [...words, `@${member.full_name} `].join(' ');
  
  setMessageInput(newValue);
  setShowMentionList(false); // Đóng danh sách
  
  // Focus lại vào input để gõ tiếp
  // (Giả sử ref của input là messageInputRef hoặc bạn tìm bằng querySelector)
  // Nếu bạn dùng input bình thường, hãy đảm bảo ref đã được gắn vào thẻ input
};
const handleKeyDown = (e) => {
  if (showMentionList) {
    if (e.key === 'ArrowDown') {
      e.preventDefault(); // Ngăn con trỏ nhảy trong textarea
      setActiveIndex((prev) => (prev + 1) % mentionList.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + mentionList.length) % mentionList.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (mentionList.length > 0) {
        handleSelectMention(mentionList[activeIndex]);
      }
    }
  }
};

  // ================= BỔ SUNG: LOGIC TÊN TRƯỞNG NHÓM =================
const getDisplayName = useCallback((msg) => {
  const isMsgMe = String(msg.senderId) === String(currentUser?.id);
  if (isMsgMe) return "Bạn";

  const originalName = msg.senderName || msg.User?.full_name || "Thành viên";
  
  // LOG ĐỂ CHECK LỖI
  if (!selectedConversation?.createdBy && selectedConversation?.isGroup) {
    console.warn("CẢNH BÁO: selectedConversation thiếu trường createdBy");
  }

  const isOwner = selectedConversation?.isGroup && 
                  String(msg.senderId) === String(selectedConversation?.createdBy);
    
  return isOwner ? `${originalName} (nhóm trưởng)` : originalName;
}, [currentUser?.id, selectedConversation]);


  
  // ================= BỔ SUNG: SAVE NEW KEY =================
const handleSaveNewKey = async (passphrase) => {
    try {
        // 1. Phái sinh khóa từ mật khẩu (mới thêm)
        const derivedKey = await deriveKeyFromPassword(passphrase);
        
        // 2. Xuất khóa sang định dạng Base64 (đã import thành công)
        const base64Key = await exportKey(derivedKey); 
        
        // 3. Lưu vào localStorage
        localStorage.setItem(`file-key-${selectedConversation?.id}`, base64Key);
        
        alert("Khóa đã được cập nhật!");
        setKeyModalOpen(false);
    } catch (error) {
        console.error("Lỗi khi tạo/lưu khóa:", error);
        alert("Có lỗi xảy ra khi tạo khóa!");
    }
};

  

  return (
    <div style={styles.chatContainer}>
      {discordStyles}

      {!selectedConversation?.isGroup && (
        <>
          {isNotConnected && !incomingRequest && (
            <div
              style={{
                backgroundColor: "#1e1f22",
                borderBottom: "1px dashed #4e5058",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  color: "#b5bac1",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                Bạn và{" "}
                <strong>{selectedConversation?.name || "đồng nghiệp"}</strong>{" "}
                chưa là đồng nghiệp.
              </div>
            </div>
          )}
          {isNotConnected && incomingRequest && (
            <div
              style={{
                backgroundColor: "rgba(242, 63, 67, 0.08)",
                borderBottom: "1px solid rgba(242, 63, 67, 0.2)",
                padding: "12px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                zIndex: 10,
              }}
            >
              <div
                style={{
                  color: "#f23f43",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
              >
                👋{" "}
                <strong>{selectedConversation?.name || "Đồng nghiệp"}</strong>{" "}
                đã gửi lời mời kết nối.
              </div>
              <button
                type="button"
                onClick={() =>
                  handleAcceptFriend?.(
                    incomingRequest.id || incomingRequest.senderId,
                  )
                }
                style={{
                  backgroundColor: "#5865f2",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 14px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Chấp nhận kết nối
              </button>
            </div>
          )}
          {isPendingConnection && (
            <div
              style={{
                backgroundColor: "#2b2d31",
                borderBottom: "1px solid #3f4147",
                borderLeft: "4px solid #5865f2",
                padding: "10px 20px",
                color: "#b5bac1",
                fontSize: "13px",
                fontWeight: "400",
                textAlign: "left",
              }}
            >
              ⏳ Yêu cầu kết nối đang chờ xác nhận.
            </div>
          )}
        </>
      )}


{/* 
  <div 
    style={{
      color: "white",
      margin: "0 10px 0 10px", 
      cursor: "pointer",
      textAlign: "center",
      fontSize: "13px",
      fontWeight: "bold",
      display: "flex", 
      background: "#5865f2", 
      borderRadius: "0 0 8px 8px", 
      alignItems: "center", 
      padding: "10px 10px" 
    }}
    onClick={() => {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      
    }}
  >
    Có [?] tin nhắn mới đang chờ bạn kể từ ngày ....
  </div> */}




{pinnedMessages?.length > 0 && (
  <div >

    
    {/* Hiển thị tin mới nhất */}
{selectedConversation?.latestPinnedMessage && (
  <div
    onClick={() =>
      handleJumpToMessage(
        selectedConversation
          .latestPinnedMessage.id
      )
    }
    style={{
      color: "#b9bbbe",
      cursor: "pointer",
      fontSize: "13px",
      marginTop: "4px",
    }}
  >
    {
      selectedConversation
        .latestPinnedMessage.senderName
    }
    :{" "}
    {selectedConversation
      .latestPinnedMessage.content?.slice(
        0,
        50
      )}
    ...
  </div>
)}
  </div>
)}
  {/* 🔥 ĐẶT ĐOẠN HIỂN THỊ KẾT QUẢ TÌM KIẾM Ở ĐÂY */}
{chatSearchQuery && (
  <div style={{ backgroundColor: "#2b2d31", borderBottom: "1px solid #3f4147", padding: "10px", overflowY: "auto" }}>
    <div style={{ color: "#fff", marginBottom: "8px", fontSize: "13px", fontWeight: "bold" }}>
      Kết quả tìm kiếm: {searchResults.length}
    </div>

{searchResults.length > 0 ? (
  <>
    {/* Sử dụng biến paginatedResults đã được khai báo ở trên */}
    {paginatedResults.map((msg) => (
      <div 
        key={msg.id} 
        onClick={() => handleJumpToMessage(msg.id)}
        style={{ cursor: "pointer", color: "#00a8fc", padding: "4px 0", fontSize: "13px" }}
      >
        {msg.content?.substring(0, 50)}...
      </div>
    ))}

    {/* Nút Xem thêm */}
    {searchPage * SEARCH_LIMIT < searchResults.length && (
      <button 
        onClick={() => setSearchPage(prev => prev + 1)}
        style={{ 
          marginTop: "10px", 
          width: "100%", 
          background: "#3f4147", 
          color: "#fff", 
          border: "none", 
          padding: "6px", 
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "12px"
        }}
      >
        Xem thêm kết quả...
      </button>
    )}
  </>
) : (
  <div style={{ color: "#949ba4", fontSize: "13px" }}>Không tìm thấy tin nhắn khớp.</div>
)}
  </div>
)}


{/* 3. DANH SÁCH TIN NHẮN (Bỏ position: absolute để không bị đè) */}
<div
  ref={scrollContainerRef}
  className="discord-scrollbar"
  onScroll={handleScroll}
  style={{ 
    ...styles.messageList, 
    overflowY: "auto", 
    flex: 1, // Để chiếm phần không gian còn lại
    display: "flex", 
    flexDirection: "column" 
  }}
>

        <div style={{ flex: "1 1 auto" }} />
        {messages.map((msg, index) => {
          const msgTime = msg.timestamp || msg.createdAt;
          const currentDate = new Date(msgTime).toLocaleDateString("vi-VN");
          const previousDate =
            index > 0
              ? new Date(
                  messages[index - 1].timestamp ||
                    messages[index - 1].createdAt,
                ).toLocaleDateString("vi-VN")
              : null;
          const showDateSeparator = currentDate !== previousDate;
          const isMsgMe = msg.senderId === currentUser?.id;
          const isEdited =
            !!msg.isEdited ||
            msg.is_edited === true ||
            (msg.content &&
              typeof msg.content === "string" &&
              msg.content.includes("|||")) ||
            (!!msg.updatedAt &&
              new Date(msg.updatedAt).getTime() - new Date(msgTime).getTime() >
                1000);

          return (
            <React.Fragment key={msg.id || index}>
              {showDateSeparator && msgTime && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    margin: "24px 0 16px 0",
                    color: "#b5bac1",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "#3f4147",
                    }}
                  />
                  <span style={{ padding: "0 10px" }}>
                    {new Date(msgTime).toLocaleDateString("vi-VN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "#3f4147",
                    }}
                  />
                </div>
              )}

              <div
                id={`msg-${msg.id}`}
                className="message-row-container"
                style={{
                  position: "relative",
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isMsgMe ? "flex-end" : "flex-start",
                  gap: "6px",
                }}
              >
                {editingMessageId === msg.id ? (
                  <div
                    style={{
                      padding: "8px 20px 8px 72px",
                      width: "100%",
                      boxSizing: "border-box",
                    }}
                  >
                    <input
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        backgroundColor: "#383a40",
                        border: "none",
                        borderRadius: "8px",
                        color: "#dbdee1",
                        outline: "none",
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(msg.id);
                        if (e.key === "Escape") setEditingMessageId(null);
                      }}
                    />
                    <div
                      style={{
                        color: "#949ba4",
                        fontSize: "12px",
                        marginTop: "4px",
                      }}
                    >
                      Ấn{" "}
                      <span
                        style={{ color: "#00a8fc", cursor: "pointer" }}
                        onClick={() => handleSaveEdit(msg.id)}
                      >
                        Enter để lưu
                      </span>{" "}
                      • Esc để{" "}
                      <span
                        style={{ color: "#00a8fc", cursor: "pointer" }}
                        onClick={() => setEditingMessageId(null)}
                      >
                        hủy
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
    

                    {isMsgMe && !msg.isDeleted && (
  <Tooltip 
    title="Thêm" 
    placement="top"
    color="#111214"
    overlayInnerStyle={{ borderRadius: '6px', fontSize: '12px' }}
  >
    <button
      className="message-action-btn"
      onClick={(e) => handleOpenMenu(e, msg)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#b5bac1',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      }}
      // Hiệu ứng hover cho nút "..."
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(78, 80, 88, 0.2)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#b5bac1';
      }}
    >
      <EllipsisOutlined style={{ fontSize: '20px' }} />
    </button>
  </Tooltip>
)}
                   
{/* 
<MessageItem
  msg={{
    ...msg,
    reactions: msg.reactions || [],
    // 🔥 TRUYỀN DỮ LIỆU REPLIED MESSAGE
    repliedMessage: msg.repliedMessage || null, 
    // Format nội dung tin nhắn
    content:
  msg.messageType === "FILE" ? "" : formatChatContent(msg.content || msg.message),
    // Xác định trạng thái hiển thị
    status:
      msg.status ||
      (msg.is_read
        ? "read"
        : msg.is_delivered
          ? "delivered"
          : "sent"),
    // Format thời gian hiển thị
    formattedTime: formatMessageTime(msgTime),
  }}
  isEdited={isEdited}
  isMe={isMsgMe}
  isOnline={onlineUsers[String(msg.senderId)]}
  senderName={getDisplayName(msg)}
  isGroupChat={selectedConversation?.isGroup === true}
  avatar={
    isMsgMe
      ? currentUser?.avatar_url
      : msg.senderAvatar ||
      msg.sender_avatar ||
        msg.User?.avatar_url ||
        selectedConversation?.avatar_url
  }
  copiedMessageId={copiedMessageId}
  styles={styles}
  onReplyClick={handleReplyClick} // 🔥 TRUYỀN HÀM XỬ LÝ KHI CLICK VÀO TIN NHẮN ĐƯỢC REPLY
  onSendReaction={(emoji, action) => sendReaction(msg.id, emoji, action)}
/> */}
  <MessageItem
  msg={{
    ...msg,
    reactions: msg.reactions || [],
    repliedMessage: msg.repliedMessage || null, 
    content: msg.messageType === "FILE" ? "" : formatChatContent(msg.content || msg.message),
    status: msg.status || (msg.is_read ? "read" : msg.is_delivered ? "delivered" : "sent"),
    formattedTime: formatMessageTime(msgTime),
  }}
  isEdited={isEdited}
  isMe={isMsgMe}
  isOnline={onlineUsers[String(msg.senderId)]}
  senderName={getDisplayName(msg)}
  isGroupChat={selectedConversation?.isGroup === true}
  avatar={
    isMsgMe
      ? currentUser?.avatar_url
      : msg.senderAvatar || msg.sender_avatar || msg.User?.avatar_url || selectedConversation?.avatar_url
  }
  copiedMessageId={copiedMessageId}
  styles={styles}
  onReplyClick={handleReplyClick}
  
  // 🔥 CẬP NHẬT ĐOẠN NÀY ĐỂ HẾT LỖI NO-UNUSED-VARS
  onSendReaction={(emoji, action) => {
    if (action === "OPEN_PICKER") {
      setActiveMsgForReaction(msg); // Sử dụng hàm này -> Hết lỗi ESLint
      setShowEmojiPicker(true);    // Mở modal
    } else {
      sendReaction(msg.id, emoji, action); // Gửi trực tiếp
    }
  }}
/>                

{!isMsgMe && !msg.isDeleted && (
  <Tooltip 
    title="Tùy chọn" 
    placement="top"
    color="#111214"
    overlayInnerStyle={{ borderRadius: '6px', fontSize: '12px' }}
  >
    <button
      type="button"
      className="message-action-btn"
      onClick={(e) => handleOpenMenu(e, msg)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4px 8px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        color: '#b5bac1',
        borderRadius: '4px',
        transition: 'all 0.2s ease'
      }}
      // Hiệu ứng hover đồng bộ
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'rgba(78, 80, 88, 0.2)';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#b5bac1';
      }}
    >
      <EllipsisOutlined style={{ fontSize: '20px' }} />
    </button>
  </Tooltip>
)}
                  </>
                )}
              </div>
            </React.Fragment>
          );
        })}
        <div className="typing-status-wrapper" style={{ padding: '0 20px' }}></div>
        <div ref={scrollRef} style={{ height: "1px", marginTop: "auto" }} /></div>

      {contextMenu.visible && (
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            backgroundColor: "#111214",
            borderRadius: "4px",
            padding: "6px",
            width: "220px",
            boxShadow: "0 8px 16px rgba(0,0,0,0.24)",
            zIndex: 9999,
          }}
        >
          {/* <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 8px",
              marginBottom: "6px",
              borderBottom: "1px solid #1f2023",
            }}
          >
            <span style={{ fontSize: "18px", cursor: "pointer" }}>😭</span>
            <span style={{ fontSize: "18px", cursor: "pointer" }}>👊</span>
            <span style={{ fontSize: "18px", cursor: "pointer" }}>🛑</span>
            <span style={{ fontSize: "18px", cursor: "pointer" }}>🥲</span>
          </div>
          <div className="context-menu-item">
            <span>Thêm Biểu Cảm</span>
            <span>❯</span>
          </div>
           */}

           {/* 1. DANH SÁCH ICON REACTION NHANH */}
<div
  style={{
    display: "flex",
    justifyContent: "space-between",
    padding: "4px 8px",
    marginBottom: "6px",
    borderBottom: "1px solid #1f2023",
  }}
>
  {["😭", "👊", "🛑", "🥲"].map((emoji) => (
    <span
      key={emoji}
      style={{ fontSize: "18px", cursor: "pointer", padding: "4px" }}
      onClick={() => {
        // Gửi reaction ngay lập tức
        sendReaction(contextMenu.message.id, emoji, "ADD");
        // Đóng menu context sau khi click
        setContextMenu({ visible: false, x: 0, y: 0, message: null });
      }}
    >
      {emoji}
    </span>
  ))}
</div>

{/* 2. NÚT MỞ BẢNG CHỌN EMOJI (Emoji Picker) */}
<div
  className="context-menu-item"
  onClick={() => {
    // Lưu tin nhắn đang được chọn vào state để Emoji Picker biết cần gửi vào đâu
    setActiveMsgForReaction(contextMenu.message);
    // Mở Emoji Picker toàn màn hình
    setShowEmojiPicker(true);
    // Đóng menu context
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
  }}
>
  <span>Thêm Biểu Cảm</span>
  <span>❯</span>
</div>
          
          {!contextMenu.message?.isDeleted &&
            contextMenu.message?.senderId === currentUser?.id && (
              <div
                className="context-menu-item"
                onClick={() => startEdit(contextMenu.message)}
              >
                <span>Chỉnh Sửa Tin Nhắn</span>
                <span>✏️</span>
              </div>
            )}
            <div 
  className="context-menu-item"
  onClick={() => {
    setReplyingToMessage(contextMenu.message); // Lưu tin nhắn cần reply
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
    // Focus vào ô input để người dùng gõ ngay
  }}
>
  <span>Trả lời</span>
  <span>↩️</span>
</div>
{/* Bỏ comment đoạn này */}
<div
  className="context-menu-item"
  onClick={(e) => {
    e.stopPropagation(); // Ngăn chặn sự kiện click lan truyền ra ngoài
    
    if (contextMenu.message) {
      togglePin(contextMenu.message);
    }
    
    // Đóng menu sau khi thực hiện
    setContextMenu({ visible: false, x: 0, y: 0, message: null });
  }}
  style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}
>
  <span>
    {contextMenu.message?.isPinned ? "Bỏ ghim tin nhắn" : "Ghim tin nhắn"}
  </span>
  <span style={{ marginLeft: "10px" }}>📌</span>
</div>
          <div className="context-menu-item">
            <span>Chuyển tiếp</span>
            <span>↪️</span>
          </div>
          <div
            style={{
              height: "1px",
              backgroundColor: "#1f2023",
              margin: "4px 0",
            }}
          />
          <div
            className="context-menu-item"
            onClick={() => {
              const rawText =
                contextMenu.message?.content ||
                contextMenu.message?.message ||
                "";
              navigator.clipboard.writeText(formatChatContent(rawText));
              setCopiedMessageId(contextMenu.message.id);
              setTimeout(() => setCopiedMessageId(null), 5000);
              setContextMenu({ visible: false, x: 0, y: 0, message: null });
            }}
          >
            <span>Sao Chép Văn Bản</span>
            <span>📋</span>
          </div>
          {!contextMenu.message?.isDeleted &&
            contextMenu.message?.senderId === currentUser?.id && (
              <div
                className="context-menu-item danger"
                style={{ color: "#f23f43" }}
                onClick={() => handleRecall(contextMenu.message?.id)}
              >
                <span>Thu hồi tin nhắn</span>
                <span>🗑️</span>
              </div>
            )}
        </div>
      )}

      {/* 🔥 CHÈN ĐOẠN CODE SHOWEMOJIPICKER VÀO ĐÂY */}
    {showEmojiPicker && (
      <div 
        style={{ 
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
          backgroundColor: 'rgba(0,0,0,0.5)' 
        }}
        onClick={() => setShowEmojiPicker(false)}
      >
        <div onClick={(e) => e.stopPropagation()}>
          <EmojiPicker 
            onEmojiClick={(emojiData) => {
               sendReaction(activeMsgForReaction.id, emojiData.emoji, "ADD");
               setShowEmojiPicker(false);
            }} 
          />
        </div>
      </div>
    )}

      {/* 2. ĐẶT ĐOẠN CODE SHOWEMOJIPICKER Ở ĐÂY */}
{showEmojiPicker && (
  <div 
    style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 9999, // Đảm bảo nó nằm trên tất cả mọi thứ
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}
    onClick={() => setShowEmojiPicker(false)}
  >
    <div onClick={(e) => e.stopPropagation()}>
<EmojiPicker 
  onEmojiClick={(emojiData) => {
    // 1. Kiểm tra nếu có tin nhắn được chọn -> Gửi Reaction
    if (activeMsgForReaction && activeMsgForReaction.id) {
      sendReaction(activeMsgForReaction.id, emojiData.emoji, "ADD");
    } 
    // 2. Nếu không có tin nhắn được chọn -> Chèn vào ô input
    else {
      setMessageInput((prev) => prev + emojiData.emoji);
    }
    
    // 3. Reset state và đóng picker
    setActiveMsgForReaction(null);
    setShowEmojiPicker(false);
  }} 
/>
    </div>
  </div>
)}


      <div style={styles.inputArea}>
        <div style={{ padding: "0 20px 8px 20px" }}>
  <TypingIndicator style={styles.inputWrapper}
      typingUsers={typingUsers}
      currentUserId={currentUser?.id}
      conversation={selectedConversation}
      messages={messages}
  />
</div>
        {isBlocked ? (
          <div
            style={{
              backgroundColor: "#2e3035",
              border: "1px solid #f23f43",
              borderRadius: "8px",
              padding: "12px 16px",
              color: "#f23f43",
              textAlign: "center",
              fontSize: "14px",
              fontWeight: "500",
              margin: "0 20px 20px 20px",
            }}
          >
            🚫 Không thể gửi tin nhắn. Bạn hoặc người dùng này đã chặn nhau.
          </div>
        ) : (
          <>
            {selectedFile && (
              <div style={styles.filePreviewBar}>
                📎 {selectedFile.name} ({formatFileSize(selectedFile.size)})
                <button
                  onClick={() => setSelectedFile(null)}
                  style={styles.cancelFile}
                >
                  ✕
                </button>
              </div>
              
            )}

            {replyingToMessage && (
  <div style={{ padding: "8px 20px", backgroundColor: "#2b2d31", borderTop: "1px solid #3f4147", fontSize: "12px", color: "#b5bac1", display: "flex", justifyContent: "space-between" }}>
    <span>Đang trả lời <b>{replyingToMessage.senderName || "Người dùng"}</b>: {replyingToMessage.content}</span>
    <button onClick={() => setReplyingToMessage(null)} style={{ background: "none", border: "none", color: "#f23f43", cursor: "pointer" }}>✕</button>
  </div>
)}



{showMentionList && (
  <div 
    className="mention-dropdown"
    style={{
      position: 'absolute',
      bottom: '60px',
      left: '10px',
      width: '250px',
      maxHeight: '200px',
      overflowY: 'auto',
      backgroundColor: '#2b2d31',
      border: '1px solid #3f4147',
      borderRadius: '8px',
      zIndex: 9999,
      boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
      padding: '5px'
    }}
  >
    <div style={{ padding: '5px', fontSize: '12px', color: '#aaa', borderBottom: '1px solid #3f4147', marginBottom: '5px' }}>
      Đang tìm: {mentionQuery || "Tất cả"}
    </div>
    
    {/* Logic lọc: Loại bỏ phần tử có tên trùng với tên của bạn hoặc ID của bạn */}
    {mentionList
      .filter(member => {
        // Giả sử member.full_name là tên hiển thị, 
        // chúng ta loại trừ nếu tên đó trùng với tên của currentUser
        const isMe = String(member.full_name).trim().toLowerCase() === String(currentUser?.full_name).trim().toLowerCase();
        return !isMe;
      })
      .map((member, index) => (
        <div 
          key={member.id}
          onClick={() => handleSelectMention(member)}
          style={{ 
            padding: '8px 10px',
            cursor: 'pointer',
            color: '#ffffff',
            backgroundColor: activeIndex === index ? '#404eed' : 'transparent',
            borderRadius: '4px'
          }}
        >
          {member.full_name}
        </div>
      ))}
  </div>
)}
            <form onSubmit={handleSend} style={styles.inputWrapper}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              {!isNotConnected && !isPendingConnection && (
  <>
    {/* Nút gửi file (+) */}
<button
      type="button"
      onClick={() => fileInputRef.current.click()}
      style={{ 
        ...styles.actionBtn, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#b5bac1' // Màu xám nhẹ hợp với giao diện tối
      }}
    >
      <PaperClipOutlined style={{ fontSize: '20px' }} />
    </button>

    {/* Nút khóa bảo mật (thay vì KeyOutlined) */}
    <button
      type="button"
      onClick={openKeyModal}
      style={{ 
        ...styles.actionBtn, 
        backgroundColor: "transparent", 
        border: "none", 
        cursor: "pointer",
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}
      title="Nhập khóa giải mã"
    >
      <SafetyCertificateOutlined style={{ fontSize: '20px', color: '#b5bac1' }} />
    </button>
{/* ========================================= */}
{/* NÚT EDIT NHÓM - CHỈ NHÓM TRƯỞNG */}
{/* ========================================= */}

{selectedConversation?.isGroup &&
  selectedConversation?.createdBy &&
  currentUser?.id &&
  String(selectedConversation.createdBy) === String(currentUser.id) && (

    <button
      type="button"
      title="Chỉnh sửa nhóm"
      onClick={() => setEditGroupModal(true)}
      style={{
        width: "34px",
        height: "34px",
        borderRadius: "50%",
        border: "none",
        background: "#5865f2",
        color: "#fff",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginLeft: "6px",
        flexShrink: 0
      }}
    >
      <CameraOutlined style={{ fontSize: "15px" }} />
    </button>
)}
  </>
)}
{/* 🔥 THÊM NÚT EMOJI VÀO ĐÂY */}
<button
  type="button"
  onClick={() => setShowEmojiPicker(!showEmojiPicker)} // Toggle bảng emoji
  style={{ 
    ...styles.actionBtn, 
    background: "transparent", 
    border: "none", 
    cursor: "pointer",
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    padding: '4px 8px'
  }}
>
  <SmileOutlined style={{ fontSize: '20px', color: '#b5bac1' }} />
</button>
              <input
                value={messageInput}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tin nhắn..."
                style={styles.textInput}
              />
<button 
  type="submit" 
  style={{ 
    ...styles.sendBtn, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s' 
  }}
>
  <SendOutlined style={{ fontSize: '18px' }} />
</button>
            </form>
            {/* 🔥 MODAL ĐƯỢC THÊM VÀO ĐÂY */}
<KeyManagementModal 
  isOpen={isKeyModalOpen} 
  onClose={() => setKeyModalOpen(false)}
  onSaveKey={handleSaveNewKey}
  conversationId={selectedConversation?.id}
  
  // SỬA LẠI ĐIỀU KIỆN TẠI ĐÂY:
  // Kiểm tra xem conversation hiện tại có dữ liệu tin nhắn cuối cùng hay không
  isConversationStarted={!!selectedConversation?.lastMessageId || (messages && messages.length > 0)}
/>

{editGroupModal && (
<EditGroupModal
  conversation={selectedConversation}
  onClose={() => setEditGroupModal(false)}
  onUpdated={(updatedConversation) => {

    // update local selected conversation
    if (typeof setSelectedConversation === "function") {
      setSelectedConversation(updatedConversation);
    }

    // update list conversation
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === updatedConversation.id
          ? updatedConversation
          : conv
      )
    );
  }}
/>
)}
          </>
        )}
      </div>
    </div>
  );
}
