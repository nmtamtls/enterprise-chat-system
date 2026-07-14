  import { useState, useEffect, useCallback, useRef } from "react";
  import axios from "axios";
  import SockJS from "sockjs-client";
  import { Client } from "@stomp/stompjs";
  import { getMessageType } from "../utils/formatFile";
  import {
    // generateAESKey,
    encryptFile,
    // exportKey,
    importKey,
  } from "../utils/cryptoFile";

  import { updateGroupAvatarApi, searchMembersApi } from "../api/conversationApi";

  export const useChat = (selectedConversation, currentUser, token) => {
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [conversations, setConversations] = useState([]);
    const [leaveGroupNotification, setLeaveGroupNotification] = useState(null);
    const [remoteKey, setRemoteKey] = useState(null); 
  // 1. Chỉ khai báo state này duy nhất
  const [isKeySynced, setIsKeySynced] = useState(false);
  const [syncTrigger, setSyncTrigger] = useState(0);
  const [unreadCount, setUnreadCount] = useState({});

  // 2. Dùng useEffect để lắng nghe và cập nhật isKeySynced
  useEffect(() => {
      const savedKey = localStorage.getItem(`file-key-${selectedConversation?.id}`);
      
      // So sánh và cập nhật state
      const synced = !!(savedKey && remoteKey && savedKey.trim() === remoteKey.trim());
      setIsKeySynced(synced);

      // DEBUG: Nhìn vào F12 -> Console
      console.log("--- DEBUG ĐỒNG BỘ ---");
      console.log("Khóa của tôi:", savedKey);
      console.log("Khóa đối phương (remoteKey):", remoteKey);
      console.log("Kết quả synced:", synced);
      
  }, [selectedConversation?.id, remoteKey, syncTrigger]); // Phụ thuộc vào cả syncTrigger

  // 3. Lắng nghe thay đổi của localStorage giữa các Tab
  useEffect(() => {
      const handleStorageChange = (e) => {
          if (e.key === `file-key-${selectedConversation?.id}`) {
              setSyncTrigger(prev => prev + 1); // Thay đổi trigger làm useEffect trên chạy lại
          }
      };
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedConversation?.id]);



    

    const stompClient = useRef(null);
    const isInitialFetchDone = useRef(false);

    // ================= FETCH CONVERSATIONS =================
    const fetchConversations = useCallback(async () => {
      if (!token || !currentUser?.id) return;

      try {
        const res = await axios.get(
          `http://localhost:8082/api/conversations/user/${currentUser.id}`,
          // `https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations/user/${currentUser.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setConversations(res.data.data || []);
      } catch (err) {
        console.error("Lỗi tải conversations:", err);
      }
    }, [token, currentUser?.id]);

    // ================= FETCH MESSAGES =================
    const fetchMessages = useCallback(
      async (conversationId) => {
        if (!conversationId || !token) return;

        try {
          const res = await axios.get(
            `http://localhost:8082/api/messages/${conversationId}`,
            // `https://tqgwvv8g-8082.asse.devtunnels.ms/api/messages/${conversationId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // ẨN TOÀN BỘ TIN NHẮN ĐÃ THU HỒI
          const filteredMessages = (res.data.data || []).filter(
            (msg) =>
              !msg.isDeleted &&
              msg.type !== "MESSAGE_RECALLED" &&
              msg.messageType !== "MESSAGE_RECALLED"
          );

          setMessages(filteredMessages);
        } catch (err) {
          console.error("Lỗi tải messages:", err);
        }
      },
      [token]
    );

    // ================= SEND DELIVERED =================
    const sendDeliveredStatus = useCallback(
      (messageId) => {
        const client = stompClient.current;

        if (!client || !client.connected || !messageId) {
          return;
        }

        try {
          client.publish({
            destination: "/app/chat.delivered",
            body: JSON.stringify({
              messageId: String(messageId),
              userId: currentUser?.id,
            }),
          });

          console.log(`>>> [Status] Delivered: ${messageId}`);
        } catch (err) {
          console.error("Lỗi khi gửi trạng thái delivered:", err);
        }
      },
      [currentUser?.id]
    );

    // ================= SEND READ =================
    const sendReadStatus = useCallback(
      (messageId) => {
        if (!stompClient.current?.connected || !messageId || !currentUser?.id) {
          return;
        }

        stompClient.current.publish({
          destination: "/app/chat.read",
          body: JSON.stringify({
            messageId,
            readerId: currentUser.id,
          }),
        });
      },
      [currentUser?.id]
    );

    // ================= FETCH INITIAL =================
    useEffect(() => {
      const fetchInitialData = async () => {
        if (!token || !currentUser?.id || isInitialFetchDone.current) {
          return;
        }

        try {
          const resPresence = await axios.get(
            "http://localhost:8082/api/presence/online-users",
            // "https://tqgwvv8g-8082.asse.devtunnels.ms/api/presence/online-users",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const initialData = {};

          if (resPresence.data) {
            Object.entries(resPresence.data).forEach(([id, status]) => {
              initialData[String(id)] = !!status;
            });
          }

          setOnlineUsers(initialData);

          await fetchConversations();

          isInitialFetchDone.current = true;
        } catch (err) {
          console.error("Lỗi fetch initial:", err);
        }
      };

      fetchInitialData();
    }, [token, currentUser?.id, fetchConversations]);

    // ================= SOCKET =================
    useEffect(() => {
      if (!currentUser?.id || !token) return;
      if (stompClient.current?.connected) return;

      const socket = new SockJS("http://localhost:8082/ws");
    //  const socket = new SockJS("https://tqgwvv8g-8082.asse.devtunnels.ms/ws");
      const client = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,

        onConnect: () => {
          console.log("✅ WebSocket Connected");
          // ================= UNREAD COUNT =================
  client.subscribe(
    `/user/${currentUser.id}/queue/unread`,
    (msg) => {

      const data = JSON.parse(msg.body);

      console.log("📩 UNREAD:", data);

      setUnreadCount((prev) => ({
        ...prev,
        [String(data.conversationId)]: data.count,
      }));
    }
  );

          client.publish({
            destination: "/app/user.online",
            body: JSON.stringify({
              userId: currentUser.id,
            }),
          });
          // --- BẠN DÁN CODE VÀO ĐÂY ---
      client.subscribe("/topic/profile-updated", (msg) => {
          const updatedUser = JSON.parse(msg.body);
          setMessages(prevMessages => 
              prevMessages.map(msg => 
                  String(msg.senderId) === String(updatedUser.id) 
                      ? { ...msg, senderAvatar: updatedUser.avatarUrl } 
                      : msg
              )
          );
      });

          // ================= PRESENCE =================
          client.subscribe("/topic/presence", (msg) => {
            const data = JSON.parse(msg.body);

            setOnlineUsers((prev) => ({
              ...prev,
              [String(data.userId)]: data.isOnline,
            }));
          });

          // ================= STATUS =================
          client.subscribe("/topic/status", (msg) => {
            const data = JSON.parse(msg.body);

            setMessages((prev) =>
              prev.map((m) => {
                const isTargetMessage =
                  data.messageId &&
                  String(m.id) === String(data.messageId);

                const isReadConversation =
                  data.status === "read" &&
                  String(m.conversationId) ===
                    String(data.conversationId) &&
                  String(m.senderId) === String(currentUser?.id);

                if (isTargetMessage || isReadConversation) {
                  return {
                    ...m,
                    status: data.status,
                    is_read: data.status === "read",
                    is_delivered:
                      data.status === "delivered" ||
                      data.status === "read",
                  };
                }

                return m;
              })
            );
          });



  // ================= NOTIFICATIONS =================
  client.subscribe(
    `/user/${currentUser.id}/queue/notifications`,
    (msg) => {
      const data = JSON.parse(msg.body);
      console.log("WebSocket Notification received:", data);

      // --- 1. Xử lý thông báo hệ thống (Rời nhóm) ---
      if (data.type === "LEAVE_GROUP") {
        // Hiển thị banner (Sử dụng functional update nếu cần, ở đây dùng trực tiếp)
        if (typeof setLeaveGroupNotification === 'function') {
          setLeaveGroupNotification(data.message);
          setTimeout(() => setLeaveGroupNotification(null), 5000);
        }

        // Thêm thông báo vào danh sách tin nhắn để hiển thị trong khung chat
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(), 
            type: "LEAVE_GROUP",
            content: data.message,
            conversationId: data.conversationId,
          },
        ]);

        // Cập nhật lại danh sách hội thoại
        setConversations((prev) => 
          prev.map((c) => 
            String(c.id) === String(data.conversationId) 
              ? { ...c, updatedAt: new Date() } 
              : c
          )
        );
        
        return; // Dừng, không xử lý như tin nhắn thông thường
      }

      // --- 2. Xử lý tin nhắn chat thông thường ---
      if (data.isDeleted || data.type === "MESSAGE_RECALLED" || data.messageType === "MESSAGE_RECALLED") {
        return;
      }

      // Chỉ gửi trạng thái đã nhận cho tin nhắn từ người khác
      if (data.id && data.senderId && String(data.senderId) !== String(currentUser.id)) {
        sendDeliveredStatus(data.id);
      }

      // Cập nhật danh sách hội thoại với tin nhắn mới nhất
      // setConversations((prev) => {
      //   const targetId = String(data.conversationId || data.id);
      //   const index = prev.findIndex((c) => String(c.id) === targetId);

      //   if (index !== -1) {
      //     const updated = {
      //       ...prev[index],
      //       lastMessage: data.content || "Tin nhắn mới",
      //       updatedAt: new Date(),
      //     };
      //     // Tối ưu: Đưa hội thoại vừa có tin nhắn lên đầu danh sách
      //     const newConversations = [...prev];
      //     newConversations.splice(index, 1);
      //     return [updated, ...newConversations];
      //   }
      //   return prev;
      // });

      // Cập nhật danh sách hội thoại với tin nhắn mới nhất
setConversations((prev) => {
  const targetId = String(data.conversationId || data.id);
  const index = prev.findIndex((c) => String(c.id) === targetId);

  if (index !== -1) {
    const updated = {
      ...prev[index],
      // CHỈ cập nhật lastMessage nếu data.content tồn tại
      lastMessage: data.content ? data.content : prev[index].lastMessage, 
      updatedAt: new Date(),
    };
    const newConversations = [...prev];
    newConversations.splice(index, 1);
    return [updated, ...newConversations];
  }
  return prev;
});

      // Cập nhật danh sách tin nhắn nếu người dùng đang ở trong hội thoại đó
      // Chỉ thêm vào state messages nếu tin nhắn thuộc hội thoại đang mở
      setMessages((prev) => [...prev, data]);
    }
  );
          // ================= RECALL GLOBAL =================
          client.subscribe(
            `/user/${currentUser.id}/queue/messages`,
            (msg) => {
              const data = JSON.parse(msg.body);

              if (
                data.type === "MESSAGE_RECALLED" ||
                data.messageType === "MESSAGE_RECALLED"
              ) {
                const targetMessageId =
                  data.messageId || data.id;

                // XÓA HẲN TIN NHẮN KHỎI UI
                setMessages((prev) =>
                  prev.filter(
                    (m) =>
                      String(m.id) !==
                      String(targetMessageId)
                  )
                );

                // XÓA LAST MESSAGE
                setConversations((prev) =>
                  prev.map((c) =>
                    String(c.id) ===
                    String(data.conversationId)
                      ? { ...c, lastMessage: "" }
                      : c
                  )
                );
              }
            }
          );
        },

        onDisconnect: () =>
          console.log("❌ WebSocket Disconnected"),

        onStompError: (frame) =>
          console.error("STOMP ERROR:", frame),
      });

      client.activate();
      stompClient.current = client;

      return () => {};
    }, [token, currentUser?.id, sendDeliveredStatus]);

    // ================= ROOM SUBSCRIBE =================
    useEffect(() => {

      setRemoteKey(null);
      const client = stompClient.current;

      if (!client || !currentUser?.id) return;

      let subChat = null;
      let subTyping = null;

      if (selectedConversation?.id) {
        fetchMessages(selectedConversation.id);

        const subscribeToRoom = () => {
          // ================= CHAT =================
          subChat = client.subscribe(
            `/topic/conversations/${selectedConversation.id}`,
            (msg) => {
              const data = JSON.parse(msg.body);

            // --- BẮT ĐẦU ĐOẠN GẮN MỚI ---
            console.log("📥 Đã nhận được tin nhắn từ server:", data);
            
            if (data.type === "KEY_EXCHANGE") {
              console.log("✅ Đã nhận khóa từ đối phương:", data.aesKey);
              setRemoteKey(data.aesKey);
              localStorage.setItem(`file-key-${selectedConversation.id}`, data.aesKey);
              return; // Dừng lại ở đây vì đây là tin nhắn hệ thống, không phải tin nhắn chat
           // Thay đoạn kiểm tra type bằng cách kiểm tra sự tồn tại của emoji hoặc action
} else if (data.messageId && data.emoji && data.action) {
    console.log("📥 Đang xử lý Reaction:", data);
    
    setMessages((prevMessages) =>
        prevMessages.map((m) => {
            // Kiểm tra ID tin nhắn
            if (String(m.id) === String(data.messageId)) {
                const currentReactions = Array.isArray(m.reactions) ? m.reactions : [];
                
                let newReactions;
                if (data.action === "ADDED" || data.action === "ADD") {
                    // Thêm reaction: Loại bỏ reaction cũ của user này (nếu có) trước khi thêm mới
                    newReactions = [
                        ...currentReactions.filter(r => String(r.userId) !== String(data.userId)),
                        { userId: data.userId, emoji: data.emoji }
                    ];
                } else if (data.action === "REMOVED") {
                    // Xóa reaction: Lọc bỏ reaction của user này
                    newReactions = currentReactions.filter(
                        (r) => !(String(r.userId) === String(data.userId) && r.emoji === data.emoji)
                    );
                } else {
                    newReactions = currentReactions;
                }
                
                return { ...m, reactions: newReactions };
            }
            return m;
        })
    );
}


              // ================= RECALL =================
  if (
    data.type === "MESSAGE_RECALLED" ||
    data.isDeleted === true
  ) {
    const targetMessageId = data.id || data.messageId;

    setMessages((prevMessages) => {
      // 1. Lọc bỏ tin nhắn bị thu hồi khỏi danh sách chính
      // 2. Cập nhật các tin nhắn đang trích dẫn (repliedMessage) tin nhắn đó
      return prevMessages
        .filter((m) => String(m.id) !== String(targetMessageId))
        .map((m) => {
          if (m.repliedMessage && String(m.repliedMessage.id) === String(targetMessageId)) {
            return {
              ...m,
              repliedMessage: {
                ...m.repliedMessage,
                content: "Tin nhắn đã được thu hồi", // Hiển thị thông báo thân thiện
              },
            };
          }
          return m;
        });
    });

    // Cập nhật lại danh sách cuộc trò chuyện
    setConversations((prevConversations) =>
      prevConversations.map((c) =>
        String(c.id) === String(selectedConversation.id)
          ? { ...c, lastMessage: "Tin nhắn đã được thu hồi" } 
          : c
      )
    );

    return;
  }

              // ================= EDIT / NEW MESSAGE =================
              setMessages((prevMessages) => {
                const isExist = prevMessages.some(
                  (m) => String(m.id) === String(data.id)
                );

                if (isExist) {
                return prevMessages.map((m) =>
    String(m.id) === String(data.id)
      ? {
          ...m,

          // ================= CONTENT =================
          content: data.content,
          message: data.content,

          // ================= EDIT TIME =================
          updatedAt:
            data.updatedAt ||
            new Date().toISOString(),

          // ================= PIN =================
          isPinned:
            data.isPinned !== undefined
              ? data.isPinned
              : m.isPinned,

          pinnedAt:
            data.pinnedAt !== undefined
              ? data.pinnedAt
              : m.pinnedAt,
        }
      : m
  );
                
                }

                return [
                  ...prevMessages,
                  {
                    ...data,
                    status: data.status || "sent",
                  },
                ];
              });

              setConversations((prevConversations) =>
                prevConversations.map((c) =>
                  String(c.id) ===
                  String(selectedConversation.id)
                    ? {
                        ...c,
                        lastMessage: data.content,
                      }
                    : c
                )
              );

              // ================= AUTO STATUS =================
              if (
                String(data.senderId) !==
                String(currentUser.id)
              ) {
                sendDeliveredStatus(data.id);

                if (document.hasFocus()) {
                  sendReadStatus(data.id);
                }
              }
            }
          );

          // ================= TYPING =================
          subTyping = client.subscribe(
            `/topic/typing/${selectedConversation.id}`,
            (msg) => {
              const data = JSON.parse(msg.body);

              setTypingUsers((prev) => ({
                ...prev,
                [String(data.userId || data.senderId)]: {
                  isTyping: data.isTyping,
                  fullName: data.fullName,
                },
              }));
            }
          );
        };

        if (client.connected) {
          subscribeToRoom();
        } else {
          const originalOnConnect = client.onConnect;

          client.onConnect = (frame) => {
            if (originalOnConnect) {
              originalOnConnect(frame);
            }

            subscribeToRoom();
          };
        }
      }

      return () => {
        if (subChat) {
          subChat.unsubscribe();

          console.log(
            "Unsubscribed chat room:",
            selectedConversation.id
          );
        }

        if (subTyping) {
          subTyping.unsubscribe();
        }
      };
    }, [
      selectedConversation?.id,
      currentUser?.id,
      fetchMessages,
      sendDeliveredStatus,
      sendReadStatus,
    ]);

    

    // ================= AUTO READ =================
    useEffect(() => {
      if (!messages.length || !selectedConversation?.id) return;

      messages.forEach((m) => {
        if (
          String(m.senderId) !== String(currentUser?.id) &&
          m.status !== "read"
        ) {
          sendReadStatus(m.id);
        }
      });
    }, [
      messages,
      selectedConversation?.id,
      currentUser?.id,
      sendReadStatus,
    ]);

    // ================= SEND MESSAGE =================

  // Thêm hàm này vào trong useChat.js
  const sendKeyToPartner = useCallback((aesKeyBase64) => {
    // Kiểm tra kết nối trước khi gửi
    if (!stompClient.current?.connected || !selectedConversation?.id) {
      console.error("Không thể gửi khóa: WebSocket chưa kết nối!");
      return;
    }

    const keyPayload = {
      conversationId: selectedConversation.id,
      senderId: currentUser.id,
      type: "KEY_EXCHANGE", // Backend dùng type này để nhận diện
      aesKey: aesKeyBase64
    };

    stompClient.current.publish({
      destination: "/app/chat.send", // Destination gửi tin nhắn thông thường
      body: JSON.stringify(keyPayload),
    });
    
    console.log("🔑 Đã gửi khóa cho đối phương qua WebSocket");
  }, [selectedConversation?.id, currentUser?.id]);


  const sendMessage = async (content, selectedFile) => {
    // --- BỔ SUNG: Kiểm tra an toàn để tránh lỗi null ---
    if (!selectedConversation || !selectedConversation.id) {
      console.error("Lỗi: Không tìm thấy hội thoại để gửi tin nhắn.");
      alert("Vui lòng chọn một cuộc trò chuyện trước khi gửi.");
      return;
    }
    // ----------------------------------------------------

    if (!stompClient.current?.connected) {
      console.error("Lỗi: WebSocket chưa kết nối.");
      return;
    }

    try {
      // 1. Lấy khóa hiện tại
      const savedKey = localStorage.getItem(`file-key-${selectedConversation.id}`);
      
      // Kiểm tra: Nếu là file thường (không phải ảnh) và chưa có khóa -> Chặn lại
      if (selectedFile && !selectedFile.type.startsWith("image/")) {
        if (!savedKey) {
          throw new Error("Vui lòng thiết lập khóa giải mã bằng mật khẩu trước khi gửi file này!");
        }
      }

      // 2. Xử lý File
      let fileData = { url: null, name: null, size: null, type: null, iv: null, encrypted: false };

      if (selectedFile) {
        const isImage = selectedFile.type.startsWith("image/");
        let fileToUpload = selectedFile;
        
        // Mã hóa file nếu không phải ảnh và ĐÃ có khóa
        if (!isImage && savedKey) {
          const aesKey = await importKey(savedKey);
          const { encryptedBlob, iv } = await encryptFile(selectedFile, aesKey);
          
          fileToUpload = new File([encryptedBlob], `${Date.now()}.enc`, { type: "application/octet-stream" });
          fileData.iv = JSON.stringify(iv);
          fileData.encrypted = true;
        }

        const formData = new FormData();
        formData.append("file", fileToUpload);

        const uploadRes = await axios.post("http://localhost:8082/api/files/upload", formData, {
          // const uploadRes = await axios.post("https://tqgwvv8g-8082.asse.devtunnels.ms/api/files/upload", formData, {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "multipart/form-data" 
          },
        });

        const resData = uploadRes.data.data || uploadRes.data;
        
        fileData = {
          ...fileData,
          url: resData.fileUrl || resData.url,
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type || "application/octet-stream", 
        };
      }

      // 3. Gửi payload qua WebSocket
      const payload = {
        conversationId: selectedConversation.id, // Bây giờ an toàn vì đã check ở trên
        senderId: currentUser.id,
        content: content?.trim() || null,
        fileUrl: fileData.url,
        fileName: fileData.name,
        fileSize: fileData.size,
        fileType: fileData.type,
        iv: fileData.iv,
        encrypted: fileData.encrypted,
        messageType: getMessageType(fileData.type, fileData.name),
      };

      stompClient.current.publish({
        destination: "/app/chat.send",
        body: JSON.stringify(payload),
      });

    } catch (err) {
      console.error("Lỗi gửi message:", err.message);
      if (err.message.includes("Vui lòng thiết lập khóa")) {
        alert(err.message);
      } else {
        alert("Có lỗi xảy ra khi gửi tin nhắn/file.");
      }
      throw err;
    }
  };

  const handleUpdateAvatar = async (convId, url) => {
      try {
          // 1. Gọi API lưu vào DB
          await updateGroupAvatarApi(convId, url);

          // 2. Phát tín hiệu qua WebSocket để các thành viên khác cập nhật UI
          if (stompClient.current?.connected) {
              const avatarUpdatePayload = {
                  conversationId: convId,
                  type: "GROUP_AVATAR_UPDATED", // Định danh loại tin nhắn này
                  newAvatarUrl: url
              };

              stompClient.current.publish({
                  destination: "/app/chat.send", // Hoặc một destination chuyên biệt cho hệ thống
                  body: JSON.stringify(avatarUpdatePayload),
              });
          }

          // 3. Cập nhật local state (để UI của chính người đổi ảnh cập nhật ngay)
          // Giả sử bạn có setConversations trong hook này
          /*
          setConversations(prev => prev.map(conv => 
              conv.id === convId ? { ...conv, groupAvatar: url } : conv
          ));
          */

          return true;
      } catch (err) {
          console.error("Lỗi đổi avatar:", err);
          throw err;
      }
  };

    // ================= EDIT MESSAGE =================
    const editMessage = useCallback(
      async (messageId, newContent) => {
        if (
          !stompClient.current?.connected ||
          !selectedConversation?.id ||
          !messageId ||
          !newContent?.trim()
        ) {
          return;
        }

        try {
          const payload = {
            messageId: String(messageId),
            conversationId: String(
              selectedConversation.id
            ),
            content: newContent.trim(),
            senderId: String(currentUser.id),
          };

          stompClient.current.publish({
            destination: "/app/chat.edit",
            body: JSON.stringify(payload),
          });

          console.log(
            `>>> [STOMP] Sent edit request for message: ${messageId}`
          );
        } catch (err) {
          console.error(
            "Lỗi khi gửi gói tin chỉnh sửa qua Socket:",
            err
          );
        }
      },
      [currentUser?.id, selectedConversation?.id]
    );
  // ================= REPLY MESSAGE =================
    const replyMessage = useCallback(
      async (replyToId, content) => {
        if (
          !stompClient.current?.connected ||
          !selectedConversation?.id ||
          !replyToId ||
          !content?.trim()
        ) {
          return;
        }

        try {
          const payload = {
            conversationId: String(selectedConversation.id),
            senderId: String(currentUser.id),
            replyToId: String(replyToId), // ID của tin nhắn gốc
            content: content.trim(),
          };

          stompClient.current.publish({
            destination: "/app/chat.reply",
            body: JSON.stringify(payload),
          });

          console.log(
            `>>> [STOMP] Sent reply for message: ${replyToId}`
          );
        } catch (err) {
          console.error(
            "Lỗi khi gửi gói tin trả lời qua Socket:",
            err
          );
        }
      },
      [currentUser?.id, selectedConversation?.id]
    );

// Đảm bảo hàm này được gọi từ Component hiển thị từng tin nhắn (MessageItem)
const sendReaction = useCallback(
  async (messageId, emoji, actionType) => {
    // Không giới hạn chỉ tin nhắn của mình, chỉ cần check kết nối
    if (!stompClient.current?.connected || !messageId) return;

    try {
      const payload = {
        messageId: String(messageId),
        conversationId: String(selectedConversation.id),
        senderId: String(currentUser.id),
        emoji: emoji,
        action: actionType, // "ADDED" hoặc "REMOVED"
      };

      stompClient.current.publish({
        destination: "/app/chat.react",
        body: JSON.stringify(payload),
      });
      
      console.log(`>>> [STOMP] Sent reaction: ${emoji} to message: ${messageId}`);
    } catch (err) {
      console.error("Lỗi khi gửi reaction:", err);
    }
  },
  [currentUser?.id, selectedConversation?.id]
);


    // ================= TYPING =================
    const sendTypingStatus = (isTyping) => {
      if (
        !stompClient.current?.connected ||
        !selectedConversation?.id
      ) {
        return;
      }

      stompClient.current.publish({
        destination: isTyping
          ? "/app/user.typing"
          : "/app/user.stopTyping",

        body: JSON.stringify({
          senderId: currentUser.id,
          conversationId: selectedConversation.id,
          fullName:
            currentUser.full_name ||
            currentUser.fullName ||
            currentUser.username,
        }),
      });
    };

    // ================= RECALL MESSAGE =================
    const recallMessage = useCallback(
      async (messageId) => {
        if (!token || !currentUser?.id || !messageId)
          return;

        try {
          await axios.patch(
            `http://localhost:8082/api/messages/${messageId}/recall`,
            // `https://tqgwvv8g-8082.asse.devtunnels.ms/api/messages/${messageId}/recall`,
            null,
            {
              params: {
                senderId: currentUser.id,
              },
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          console.log(
            `>>> [Success] Recalled message: ${messageId}`
          );

          // XÓA HẲN TIN NHẮN
          setMessages((prevMessages) =>
            prevMessages.filter(
              (m) =>
                String(m.id) !== String(messageId)
            )
          );

          // XÓA LAST MESSAGE
          if (selectedConversation?.id) {
            setConversations((prevConversations) =>
              prevConversations.map((c) =>
                String(c.id) ===
                String(selectedConversation.id)
                  ? { ...c, lastMessage: "" }
                  : c
              )
            );
          }
        } catch (err) {
          console.error(
            "Lỗi khi thu hồi tin nhắn:",
            err.response?.data || err.message
          );

          throw err;
        }
      },
      [token, currentUser?.id, selectedConversation?.id]
    );

    // =====================================================
// SEARCH MEMBERS FOR TAGGING
// =====================================================
const searchMembers = useCallback(async (query) => {
    if (!selectedConversation?.id || !query) return [];
    try {
        // Gọi hàm API đã tạo trong conversationApi.js
        const results = await searchMembersApi(selectedConversation.id, query);
        return results;
    } catch (err) {
        console.error("Lỗi tìm kiếm thành viên để tag:", err);
        return [];
    }
}, [selectedConversation?.id]);

    // ================= RETURN =================
    return {
      messages,
      setMessages,
      onlineUsers,
      typingUsers,
      conversations,
      leaveGroupNotification, 
      setLeaveGroupNotification, 
      isKeySynced,
      remoteKey,
      sendKeyToPartner,
      handleUpdateAvatar,
      unreadCount,
      sendReaction,
      searchMembers,
    

      sendMessage,
      sendTypingStatus,
      sendReadStatus,
      sendDeliveredStatus,
      recallMessage,
      editMessage,
      replyMessage,
      selectedConversation,
      fetchConversations,
      setConversations,
    };
  };