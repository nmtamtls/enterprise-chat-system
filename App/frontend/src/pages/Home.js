import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import axios from "axios";
import { Tooltip } from 'antd'; // Nhớ import Tooltip
import Chat from "./chat/ChatPage";
import { useHomeData } from "../hooks/useHomeData";

import { removeMemberFromGroupApi } from "../api/conversationApi";
import { useChat } from "../hooks/useChat";
import { useFriendSocket } from "../hooks/useFriendSocket";
import AddFriendModal from "../components/chat/AddFriendModal";
import styles from "../styles/Home.module.css";
import { SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import UserDetailModal from "../components/layout/UserDetailModal";
import { EyeOutlined, EyeInvisibleOutlined, SearchOutlined } from '@ant-design/icons';
import { 
  BellOutlined, 
  BellFilled,
  PushpinOutlined, 
  HomeFilled,
} from '@ant-design/icons';
import { TeamOutlined, UserOutlined, MessageOutlined} from '@ant-design/icons';
import { UserAddOutlined, FlagOutlined } from '@ant-design/icons';
import PinModal from "../components/chat/PinModal";
// Thêm dòng này vào đầu file Home.js
import { getPinnedMessagesApi } from "../api/messageApi";
import ReportModal from '../components/chat/ReportModal'; // Đường dẫn tới file bạn vừa tạo
export default function Home() {
  const token = localStorage.getItem("token");
  const { user, friends, allUsers, loading, fetchFriends, reloadUser,setUser ,setFriends, setAllUsers } = useHomeData(token);
  const isRedirecting = useRef(false);
  // Thêm dòng này vào đầu component Home.js
const currentUser = JSON.parse(localStorage.getItem("user"));

  // --- States ---
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState("ALL");
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const [usersWhoBlockedMe, setUsersWhoBlockedMe] = useState([]);
  const [blockedList, setBlockedList] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isRightSidebarVisible, setIsRightSidebarVisible] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isReportModalVisible, setIsReportModalVisible] = useState(false);
  const [reportTarget, setReportTarget] = useState({ id: null, type: null });


  const [sentRequests, setSentRequests] = useState([]); 
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinTrigger, setPinTrigger] = useState(0); 

  //CSS
  const [hoveredMember, setHoveredMember] = useState(null);

  


// 2. Định nghĩa hàm xử lý cập nhật sau khi gửi
const handleFriendRequestSent = (targetUserId) => {
  // Cập nhật state để kích hoạt re-render
  setSentRequests(prev => [...prev, targetUserId]);
  
  // NẾU CẦN: Gọi lại API để làm mới danh sách bạn bè/lời mời
  fetchFriends(); // Giả sử hàm này từ useHomeData giúp làm mới dữ liệu
};

  // Tìm đến nơi khai báo các const useState(...) và thêm:
const [leaveGroupStatus, setLeaveGroupStatus] = useState(null);

const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);


  // 1. State quản lý từ khóa tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);

// =========================================================================
  // LOGIC KIỂM TRA MỐI QUAN HỆ ĐỂ TRUYỀN SANG KHUNG CHAT GIỮA (ĐÃ SỬA LỖI)
  // =========================================================================

  // 1. Kiểm tra xem người đang chọn nhắn tin có trong danh sách bạn bè không
  const isCurrentFriend = useMemo(() => {
    if (!selectedUser || selectedUser.isGroup) return true;
    return friends && friends.some(f => String(f.id) === String(selectedUser.id));
  }, [friends, selectedUser]);

  // 2. Kiểm tra xem đối phương có đang gửi lời mời ĐẾN cho mình không
  const incomingRequest = useMemo(() => {
    if (!selectedUser || selectedUser.isGroup) return null;
    return pendingRequests && pendingRequests.find(r => 
      String(r.senderId) === String(selectedUser.id) || String(r.id) === String(selectedUser.id)
    );
  }, [pendingRequests, selectedUser]);

  // 3. Đã loại bỏ hoàn toàn biến lỗi outgoingRequests
  // Trạng thái chưa kết nối (Khi họ không phải là bạn và họ cũng không gửi lời mời cho mình)
  const isNotConnected = !isCurrentFriend && !incomingRequest;

  // 4. Nếu bạn không có danh sách lời mời gửi đi từ Backend, hãy tạm để false 
  // Để giao diện ưu tiên hiển thị nút "Kết nối" (isNotConnected) hoặc "Chấp nhận kết nối" (incomingRequest)
  const isPendingConnection = false;
  // --- Chat Hook ---


const friendSocketRef = useFriendSocket(user, (notification) => {

  // =========================================================================
  // TRƯỜNG HỢP 1: CÓ LỜI MỜI KẾT BẠN MỚI
  // =========================================================================
  if (
    notification.type === "FRIEND_REQUEST" ||
    !notification.type
  ) {

    setPendingRequests((prev) => {

      // 🔥 tránh duplicate
      const exists = prev.some(
        (p) => p.id === notification.id
      );

      if (exists) return prev;

      return [notification, ...prev];
    });
  }

  // =========================================================================
  // TRƯỜNG HỢP 2: ĐỐI PHƯƠNG ĐÃ CHẤP NHẬN KẾT BẠN
  // =========================================================================
  else if (notification.type === "FRIEND_ACCEPTED") {

    const displayName =
      notification.fullName ||
      notification.username ||
      "Một người dùng";

    alert(` ${displayName} đã chấp nhận lời mời kết nối!`);

    // 🔥 reload realtime friend list
    if (typeof fetchFriends === "function") {
      fetchFriends();
    }
  }

  // =========================================================================
  // 🔥 TRƯỜNG HỢP 3:
  // ĐƯỢC THÊM VÀO NHÓM REALTIME
  // =========================================================================
  else if (notification.type === "GROUP") {

    console.log(
      "📢 Bạn vừa được thêm vào nhóm:",
      notification
    );

    const groupName =
      notification.groupName ||
      notification.name ||
      "Không xác định";

    // 🔥 Alert realtime
    alert(`Bạn đã được thêm vào nhóm ${groupName}`);

    // 🔥 Reload sidebar trái ngay lập tức
    if (typeof fetchConversations === "function") {
      fetchConversations();
    }
  }

  // =========================================================================
  // 🔥 TRƯỜNG HỢP 4 (MỚI):
  // REALTIME UPDATE TÊN / AVATAR GROUP
  // =========================================================================
  else if (notification.type === "GROUP_UPDATED") {

    const group =
      notification.data || notification;

    console.log(
      "🔥 GROUP UPDATED REALTIME:",
      group
    );

    // =====================================================
    // UPDATE SIDEBAR CONVERSATIONS
    // =====================================================
    if (typeof setConversations === "function") {

      setConversations((prev) =>

        prev.map((conv) => {

          if (
            String(conv.id) ===
            String(group.id)
          ) {

            return {

              ...conv,

              // 🔥 update realtime tên nhóm
              name:
                group.name ||
                conv.name,

              full_name:
                group.name ||
                conv.full_name,

              // 🔥 update realtime avatar nhóm
              groupAvatar:
                group.groupAvatar ||
                conv.groupAvatar,

              avatar:
                group.groupAvatar ||
                conv.avatar,

              avatar_url:
                group.groupAvatar ||
                conv.avatar_url,
            };
          }

          return conv;
        })
      );
    }

    // =====================================================
    // UPDATE KHUNG CHAT ĐANG MỞ
    // =====================================================
    if (typeof setSelectedUser === "function") {

      setSelectedUser((prev) => {

        if (!prev) return prev;

        if (
          String(prev.id) ===
          String(group.id)
        ) {

          return {

            ...prev,

            name:
              group.name ||
              prev.name,

            full_name:
              group.name ||
              prev.full_name,

            groupAvatar:
              group.groupAvatar ||
              prev.groupAvatar,

            avatar:
              group.groupAvatar ||
              prev.avatar,

            avatar_url:
              group.groupAvatar ||
              prev.avatar_url,
          };
        }

        return prev;
      });
    }
  }

  // =========================================================================
  // TRƯỜNG HỢP 5: ĐỐI PHƯƠNG HỦY KẾT BẠN
  // =========================================================================
  else if (notification.type === "FRIEND_REMOVED") {

    console.log(
      "Phát hiện có người vừa hủy kết nối real-time:",
      notification.id
    );

    // 🔥 Không reset selectedUser để tránh mất chat
    if (typeof fetchFriends === "function") {
      fetchFriends();
    }
  }

  // =========================================================================
  // 🚫 TRƯỜNG HỢP 6:
  // PHÁT HIỆN BỊ CHẶN REALTIME
  // =========================================================================
  else if (notification.type === "USER_BLOCKED") {

    console.log(
      "Bạn đã bị chặn real-time bởi User ID:",
      notification.id
    );

    // 🔥 Add vào blacklist local
    if (typeof setUsersWhoBlockedMe === "function") {

      setUsersWhoBlockedMe((prev) => {

        if (
          prev.includes(String(notification.id))
        ) {
          return prev;
        }

        return [
          ...prev,
          String(notification.id),
        ];
      });
    }

    // 🔥 reload friends
    if (typeof fetchFriends === "function") {
      fetchFriends();
    }
  }

  // =========================================================================
  // 🔓 TRƯỜNG HỢP 7:
  // ĐỐI PHƯƠNG GỠ CHẶN
  // =========================================================================
  else if (notification.type === "USER_UNBLOCKED") {

    console.log(
      "Bạn đã được gỡ chặn real-time bởi User ID:",
      notification.id
    );

    // 🔥 remove khỏi blacklist local
    if (typeof setUsersWhoBlockedMe === "function") {

      setUsersWhoBlockedMe((prev) =>
        prev.filter(
          (id) =>
            id !== String(notification.id)
        )
      );
    }

    // 🔥 reload friends
    if (typeof fetchFriends === "function") {
      fetchFriends();
    }
  }

  // =========================================================================
  // DEFAULT
  // =========================================================================
  else {

    console.log(
      "📩 Notification via Socket:",
      notification
    );

  }

});

  const { onlineUsers, conversations, fetchConversations, setConversations, 
    // unreadCount
  } = useChat(null,user,token,);

  // THÊM LOGIC FETCH & WEBSOCKET VÀO ĐÂY:
  const fetchPending = useCallback(async () => {
  if (!user?.id) return;
  try {
    const res = await axios.get(`http://localhost:8082/api/contacts/requests/${user.id}`, {
    //  const res = await axios.get(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/requests/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Danh sách lời mời nhận được:", res.data); // Kiểm tra dòng này
    setPendingRequests(res.data.data || res.data || []);
  } catch (err) {
    console.error(err);
  }
}, [user?.id, token]);

// Khởi tạo lấy dữ liệu lần đầu
useEffect(() => {
  if (user && user.id) {
    fetchPending();
  }
}, [user, fetchPending]);

  // --- Auth Check ---
  useEffect(() => {
    if (!loading && !user && !isRedirecting.current) {
      isRedirecting.current = true;
      window.location.href = "/login";
    }
  }, [user, loading]);
  // Tìm nơi bạn khai báo các useState khác như groupName, selectedMembers...
  // Và thêm dòng này vào:
  const [memberSearchQuery, setMemberSearchQuery] = useState("");

  // --- Helpers ---
  const isUserOnline = useCallback(
    (u) => {
      // console.log("Checking status for:", u.username, "Is online:", !!onlineUsers[String(u.id)]);
      if (!u || !u.id || !onlineUsers || u.isGroup) return false;
      return !!onlineUsers[String(u.id)];
    },
    [onlineUsers],
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa cập nhật";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };


  // Logic Tìm kiếm dành riêng cho CỘT GIỮA
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !allUsers) return { users: [], groups: [] };
    const lowQuery = searchQuery.toLowerCase();

    const users = allUsers
      .filter((u) => String(u.id) !== String(user.id))
      .filter(
        (u) =>
          (u.full_name && u.full_name.toLowerCase().includes(lowQuery)) ||
          (u.username && u.username.toLowerCase().includes(lowQuery)),
      );

    const groups = (conversations || [])
      .filter(
        (c) =>
          c.type === "GROUP" &&
          c.name &&
          c.name.toLowerCase().includes(lowQuery),
      )
      .map((g) => ({ ...g, isGroup: true, full_name: g.name }));

    return { users, groups };
  }, [searchQuery, allUsers, conversations, user]);

  const { onlineMembers, offlineMembers } = useMemo(() => {
  // Thay allUsers bằng friends để chỉ hiển thị những người đã kết bạn ở cột phải
  if (!friends || !user) return { onlineMembers: [], offlineMembers: [] };

  // Loại bỏ chính mình khỏi danh sách hiển thị
  const others = friends.filter((u) => String(u.id) !== String(user.id));

  return {
    onlineMembers: others.filter((u) => isUserOnline(u)),
    offlineMembers: others.filter((u) => !isUserOnline(u)),
  };
}, [friends, user, isUserOnline]); // Đừng quên đổi dependency từ allUsers thành friends

  // --- Handlers ---
  // Tìm vị trí khai báo các state khác trong Home.js và thêm dòng này:
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const handleSearchChat = (e) => {
    setChatSearchQuery(e.target.value);
  };

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn thoát không?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };



useEffect(() => {

  // ================= CHECK =================
  if (!token || !user?.id) return;

  // ================= FETCH CONVERSATIONS =================
  const loadConversations = async () => {

    try {

      const res = await axios.get(
        `http://localhost:8082/api/conversations/user/${user.id}`,
          //  `https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations/user/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // ================= KHÔNG OVERWRITE BỪA =================
      setConversations((prev) => {

        // nếu chưa có dữ liệu cũ
        if (!prev || prev.length === 0) {
          return res.data.data || [];
        }

        // merge unread realtime cũ với api mới
        return (res.data.data || []).map((newConv) => {

          const oldConv = prev.find(
            (p) => String(p.id) === String(newConv.id)
          );

          return {
            ...newConv,

            // giữ unread realtime mới nhất
            unreadCount:
              oldConv?.unreadCount ??
              newConv.unreadCount ??
              0,
          };
        });
      });

    } catch (err) {

      console.error(
        "Lỗi lấy danh sách conversation:",
        err
      );
    }
  };

  loadConversations();

}, [token, user?.id, setConversations]);

useEffect(() => {
  console.log("CONVERSATIONS UPDATED:", conversations);
}, [conversations]);

const friendsWithUnread = friends.map((f) => {

  const conversation = conversations.find((c) => {

    if (c.type !== "PRIVATE") return false;

    const hasFriend =
      c.memberNames?.includes(f.full_name) ||
      c.memberNames?.includes(f.username);

    const hasCurrentUser =
      c.memberNames?.includes(user.full_name) ||
      c.memberNames?.includes(user.username);

    return hasFriend && hasCurrentUser;
  });

  return {
    ...f,
    unread: Number(conversation?.unreadCount || 0),
    conversationId: conversation?.id || null,
  };
});

  const handleCreateGroup = async () => {

  if (!groupName.trim() || selectedMembers.length < 2) {
    alert("Vui lòng nhập tên nhóm và chọn ít nhất 2 thành viên.");
    return;
  }

  const payload = {
    type: "GROUP",
    name: groupName,
    createdBy: user.id,
    memberIds: [...selectedMembers, user.id],
  };

  try {

    const res = await axios.post(
      "http://localhost:8082/api/conversations",
      //  "https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const newGroup = res.data.data || res.data;

    if (newGroup) {

      // =========================================
      // 🔥 GỬI REALTIME CHO NHỮNG NGƯỜI ĐƯỢC ADD
      // =========================================
      const stompClient = friendSocketRef?.current;

      if (stompClient && stompClient.connected) {

        selectedMembers.forEach((memberId) => {

          stompClient.publish({
            destination: "/app/groups/create",
            body: JSON.stringify({
              receiverId: memberId,
              senderId: user.id,
              groupId: newGroup.id,
              groupName: newGroup.name,
              type: "GROUP",
            }),
          });

        });

      }

      // =========================================
      // 🔥 UI NGƯỜI TẠO NHÓM
      // =========================================
      alert("Tạo nhóm thành công!");

      setIsGroupModalOpen(false);

      setGroupName("");

      setSelectedMembers([]);

      // 🔥 LOAD LẠI DANH SÁCH NHÓM
      if (typeof fetchConversations === "function") {
        await fetchConversations();
      }

      // 🔥 AUTO CHỌN NHÓM MỚI
      setSelectedUser({
        ...newGroup,
        id: newGroup.id,
        conversationId: newGroup.id,
        full_name: newGroup.name,
        isGroup: true,
        createdBy: newGroup.createdBy || payload.createdBy,
      });

    }

  } catch (err) {

    console.error("CREATE GROUP ERROR:", err);

    alert(
      "Lỗi: " +
      (err.response?.data?.message || "Kiểm tra lại Backend")
    );

  }

};

  const toggleMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id],
    );
  };

 const openConversation = async (item) => {

  console.log("DEBUG: Dữ liệu nhóm được chọn:", item);

  // clear search
  setSearchQuery("");

  // ================= EXIST CONVERSATION =================
  if (item.isGroup || item.conversationId) {

    const conversationId =
      item.conversationId || item.id;

    // reset unread realtime
    setConversations((prev) =>
      prev.map((c) =>
        String(c.id) === String(conversationId)
          ? {
              ...c,
              unreadCount: 0,
            }
          : c
      )
    );

    setSelectedUser({
      ...item,
      conversationId,
      createdBy:
        item.createdBy || item.creatorId,
    });

    return;
  }

  // ================= CREATE PRIVATE =================
  try {

    const res = await axios.post(
      "http://localhost:8082/api/conversations",
      // "https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations",
      {
        type: "PRIVATE",
        memberIds: [user.id, item.id],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const convData =
      res.data.data || res.data;

    if (convData) {

      // thêm conversation mới vào state nếu chưa có
      setConversations((prev) => {

        const exists = prev.some(
          (c) =>
            String(c.id) ===
            String(convData.id)
        );

        if (exists) return prev;

        return [
          ...prev,
          {
            ...convData,
            unreadCount: 0,
          },
        ];
      });

      setSelectedUser({
        ...item,
        conversationId: convData.id,
        createdBy:
          convData.createdBy ||
          convData.creatorId,
      });
    }

  } catch (err) {

    console.error(
      "Lỗi mở cuộc trò chuyện:",
      err
    );
  }
};

  const handleAcceptFriend = async (requestId) => {
    try {
      // Tìm thông tin lời mời để lấy ID người gửi (đối phương) nhằm mục đích bắn socket
      const targetReq = pendingRequests.find((r) => r.id === requestId);

      // 1. Gọi API lưu trạng thái Chấp nhận vào hệ thống Database
      await axios.put(`http://localhost:8082/api/contacts/accept/${requestId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      //  await axios.put(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/accept/${requestId}`, {}, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // 2. Xóa lời mời vừa xử lý ra khỏi Tab Chờ (Pending) trên UI của bạn
      setPendingRequests((prev) => prev.filter((p) => p.id !== requestId));
      
      // 3. Tải lại danh sách bạn bè phía BẠN
      // useMemo quản lý [onlineMembers, offlineMembers] phụ thuộc vào `friends` sẽ tự tính toán lại
      // và đưa người bạn này vào đúng cột Trực tuyến hoặc Ngoại tuyến ngay tức khắc
      if (typeof fetchFriends === 'function') {
        await fetchFriends();
      }

      // 4. Đồng bộ lại danh sách chờ từ API
      if (typeof fetchPending === 'function') {
        fetchPending(); 
      }

      // 5. BẮN TIN REALTIME QUA SOCKET SANG ĐỐI PHƯƠNG
      const stompClient = friendSocketRef?.current; // Lấy kết nối STOMP Client hiện tại từ Ref
      if (stompClient && stompClient.connected && targetReq) {
        stompClient.publish({
          destination: "/app/contacts/accept", // Route xử lý tương ứng cấu hình ở Backend
          body: JSON.stringify({
            id: requestId,
            senderId: user?.id,              // Bạn là người nhấn nút
            receiverId: targetReq.senderId || targetReq.id, // Đối phương nhận thông báo
            type: "FRIEND_ACCEPTED"          // Gắn tag định danh sự kiện
          }),
        });
      }

      alert("Đã đồng ý kết nối thành công!");
    } catch (err) {
      console.error("Lỗi chấp nhận kết nối realtime:", err);
      alert("Không thể chấp nhận lời mời");
    }
  };

  const handleDeclineFriend = async (requestId) => {
  try {
    await axios.delete(`http://localhost:8082/api/contacts/${requestId}`, {
    //  await axios.delete(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/${requestId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPending();
  } catch (err) {
    alert("Không thể từ chối lời mời");
  }
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy kết nối với người này?"))
      return;
    try {
      await axios.delete(
        `http://localhost:8082/api/contacts/unfriend/${user.id}/${friendId}`,
        // `https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/unfriend/${user.id}/${friendId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      alert("Hủy kết nối thành công!");
      setSelectedUser(null); // Đóng tab chat hoặc profile của người đó lại

      // SỬA TẠI ĐÂY: Thay thế window.location.reload() bằng hàm fetch lại dữ liệu
      if (typeof fetchFriends === "function") {
        fetchFriends(); // Giao diện của mình tự động cập nhật mà không bị nháy trắng trang
      }
    } catch (error) {
      console.error("Lỗi khi hủy kết nối:", error);
      alert("Hủy kết nối thất bại.");
    }
  };
// // Hàm tải danh sách những người đã chặn từ Backend (Đã bọc useCallback để tránh lỗi ESLint)


// ===== 1. TẢI DANH SÁCH NHỮNG NGƯỜI ĐÃ CHẶN (Bọc useCallback chống lặp) =====
  const fetchBlockedList = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`http://localhost:8082/api/contacts/blocked-list/${user.id}`, {
      //  const res = await axios.get(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/blocked-list/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Kiểm tra cấu trúc bọc dữ liệu của ApiResponse từ Backend
      if (res.data) {
        const data = res.data.success ? res.data.data : res.data;
        setBlockedList(data);
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách chặn:", err);
    }
  }, [user?.id, token]);

  // Tự động tải danh sách chặn khi Component mount hoặc hàm fetch thay đổi
  useEffect(() => {
    fetchBlockedList();
  }, [fetchBlockedList]);


// --- HÀM XỬ LÝ CHẶN (BLOCK) - CẬP NHẬT REALTIME CHO CẢ 2 BÊN ---
  const handleBlock = async (blockedId) => {
    if (!window.confirm("Bạn có chắc chắn muốn chặn người này? Bạn sẽ không thể nhận tin nhắn từ họ.")) return;
    try {
      // 1. Gọi API cập nhật trạng thái chặn vào Database
      await axios.put(`http://localhost:8082/api/contacts/block/${user.id}/${blockedId}`, {}, {
      // await axios.put(`https://tqgwvv8g-8082.asse.devtunnels.ms/contacts/block/${user.id}/${blockedId}`, {}, {  
      headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Đã chặn thành công!");
      setSelectedUser(null); // Đóng màn hình chat hiện tại ngay lập tức [cite: 300]

      // 2. 🔥 BẮN TIN REALTIME QUA SOCKET SANG CHO NGƯỜI BỊ CHẶN [cite: 401]
      const stompClient = friendSocketRef?.current; 
      if (stompClient && stompClient.connected) { 
        stompClient.publish({
          destination: "/app/contacts/accept", // Tận dụng route websocket xử lý thông báo contact [cite: 402]
          body: JSON.stringify({
            senderId: user?.id,             // ID của bạn (Người chặn) [cite: 402, 403]
            receiverId: blockedId,          // ID của đối phương (Người bị chặn) [cite: 403]
            type: "USER_BLOCKED"            // Tag sự kiện chặn người dùng
          }),
        });
      }

      // 3. Cập nhật giao diện ngầm tại máy của bạn mà không cần F5 [cite: 294, 295]
      if (typeof fetchFriends === "function") {
        await fetchFriends(); // Xóa họ khỏi danh sách bạn bè cột trái & cột phải tức thì [cite: 251]
      }
      if (typeof fetchBlockedList === "function") {
        fetchBlockedList(); // Đưa họ vào danh sách hiển thị ở Tab "Đã chặn" [cite: 297]
      }

    } catch (err) {
      alert("Không thể chặn người dùng này: " + (err.response?.data?.message || "Lỗi hệ thống")); 
    }
  };


  // ===== 3. HÀM XỬ LÝ GỠ CHẶN (UNBLOCK) - REALTIME & KHÔNG REFRESH TRANG =====
  const handleUnblock = async (blockedId) => {
    try {
      // Giữ nguyên phương thức axios.put đồng bộ với @PutMapping ở Backend của bạn
      await axios.put(`http://localhost:8082/api/contacts/unblock/${user.id}/${blockedId}`, {}, {
        // await axios.put(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/unblock/${user.id}/${blockedId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Đã gỡ chặn thành công!");

      // 🔥 THAY THẾ RELOAD: Gọi lại các hàm tải dữ liệu ngầm để làm mới giao diện
      fetchBlockedList(); // Xóa người đó ra khỏi danh sách chặn ngay lập tức
      
      if (typeof fetchFriends === "function") {
        fetchFriends(); // Cập nhật lại danh sách bạn bè (nếu trước đó có kết bạn thì họ sẽ hiện lại)
      }

    } catch (err) {
      alert("Không thể gỡ chặn người dùng này: " + (err.response?.data?.message || "Lỗi hệ thống"));
    }
  };
// 🔥 TÍNH TOÁN TRẠNG THÁI CHẶN HAI CHIỀU (SỬ DỤNG BIẾN usersWhoBlockedMe)
  const isTargetBlockedBothWays = useMemo(() => {
    if (!selectedUser || selectedUser.isGroup) return false;
    
    // 1. Kiểm tra xem BẠN có chặn đối phương không (Từ blockedList của bạn)
  const iBlockedThem = blockedList && blockedList.some(b => String(b.id) === String(selectedUser.id));
    
    // 2. Kiểm tra xem ĐỐI PHƯƠNG có chặn bạn không (Từ state real-time bắt qua socket)
  const theyBlockedMe = usersWhoBlockedMe && usersWhoBlockedMe.includes(String(selectedUser.id));
    
    // Chỉ cần 1 trong 2 bên chặn nhau là tính là bị Block
    return iBlockedThem || theyBlockedMe;
  }, [blockedList, usersWhoBlockedMe, selectedUser]);


const handleLeaveGroup = async (groupId) => {
  try {
    await axios.delete(`http://localhost:8082/api/conversations/${groupId}/leave`, {
    // await axios.delete(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations/${groupId}/leave`, {  
    headers: { Authorization: `Bearer ${token}` }
    });
    
    setLeaveGroupStatus("Bạn đã rời khỏi nhóm thành công!");
    
    // Đóng chat và cập nhật lại danh sách hội thoại ngay lập tức
    setSelectedUser(null);
    if (typeof fetchConversations === 'function') fetchConversations();
    
  } catch (err) {
    console.error("Lỗi khi rời nhóm:", err);
    setLeaveGroupStatus("Lỗi: " + (err.response?.data?.message || "Không thể rời nhóm"));
  }
};



useFriendSocket(user, (data) => {

  // =====================================================
  // 1. XỬ LÝ RỜI NHÓM
  // =====================================================
  if (data.type === "LEAVE_GROUP") {

    setLeaveGroupStatus(data.message);

    // 🔥 Reload sidebar conversations
    if (typeof fetchConversations === "function") {
      fetchConversations();
    }
  }

  // =====================================================
  // 2. REALTIME KHI ĐƯỢC ADD VÀO NHÓM
  // =====================================================
  else if (data.type === "GROUP") {

    console.log("📢 GROUP:", data);

    // alert(`Bạn đã được thêm vào nhóm ${data.groupName}`);

    // 🔥 Reload danh sách nhóm bên trái
    if (typeof fetchConversations === "function") {
      fetchConversations();
    }
  }

  // =====================================================
  // 3. REALTIME PROFILE UPDATE
  // =====================================================
  else if (data.type === "PROFILE_UPDATED") {

    const rawData = data.data;

    // 🔥 Normalize data
    const normalizedData = {

      ...rawData,

      full_name:
        rawData.fullName ||
        rawData.full_name ||
        rawData.username,

      fullName:
        rawData.fullName ||
        rawData.full_name ||
        rawData.username,

      avatar_url:
        rawData.avatarUrl ||
        rawData.avatar_url ||
        "https://cdn.discordapp.com/embed/avatars/0.png",

      avatarUrl:
        rawData.avatarUrl ||
        rawData.avatar_url ||
        "https://cdn.discordapp.com/embed/avatars/0.png",

      isActuallyOnline:
        rawData.status === "active" ||
        rawData.online === true,
    };

    // =====================================================
    // UPDATE FRIEND LIST
    // =====================================================
    setFriends((prevFriends) =>
      prevFriends.map((f) =>
        String(f.id) === String(normalizedData.id)
          ? { ...f, ...normalizedData }
          : f
      )
    );

    // =====================================================
    // UPDATE CURRENT USER
    // =====================================================
    if (
      user &&
      String(normalizedData.id) === String(user.id)
    ) {

      setUser((prev) => ({
        ...prev,
        ...normalizedData,
      }));
    }

    // =====================================================
    // UPDATE SEARCH USERS
    // =====================================================
    setAllUsers((prevAll) =>
      prevAll.map((u) =>
        String(u.id) === String(normalizedData.id)
          ? { ...u, ...normalizedData }
          : u
      )
    );

    console.log(
      "✅ State updated via Socket:",
      normalizedData
    );
  }

  // =====================================================
  // 4. LOG DEFAULT
  // =====================================================
  else {

    console.log("📩 Notification via Socket:", data);

  }

});



// Trong Home.js
const [mutedUsers, setMutedUsers] = useState(() => {
  const saved = localStorage.getItem("mutedUsers");
  return saved ? JSON.parse(saved) : {}; // Lưu dạng { "userId1": true, "userId2": true }
});

// Hàm toggle chỉ cho user hiện tại đang chat
const toggleMuteForUser = (userId) => {
  setMutedUsers((prev) => {
    const newState = { ...prev, [userId]: !prev[userId] };
    localStorage.setItem("mutedUsers", JSON.stringify(newState));
    return newState;
  });
};



useEffect(() => {
  let isMounted = true;

  const loadPinnedData = async () => {
    // 1. Kiểm tra ID hội thoại
    if (!selectedUser?.conversationId) {
      if (isMounted) setPinnedMessages([]);
      return;
    }

    try {
      const res = await getPinnedMessagesApi(selectedUser.conversationId);
      
      if (res?.success && isMounted) {
        const pinList = res.data || [];

        // Cập nhật State danh sách ghim
        setPinnedMessages(pinList);

        // Cập nhật thông tin hội thoại để UI sidebar tự cập nhật chấm đỏ
        if (typeof setSelectedConversation === "function") {
          setSelectedConversation((prev) => {
            if (!prev || prev.id !== selectedUser.conversationId) return prev;
            
            return {
              ...prev,
              hasPinnedMessages: pinList.length > 0,
              pinnedCount: pinList.length,
              latestPinnedMessage: pinList[pinList.length - 1] || null,
            };
          });
        }
      }
    } catch (err) {
      console.error("Lỗi load pinned data:", err);
    }
  };

  loadPinnedData();

  return () => { isMounted = false; };
  
// Bỏ setSelectedConversation khỏi dependency nếu nó là state setter từ useState
}, [selectedUser?.conversationId, isPinModalOpen, pinTrigger]);


// const handleOpenReport = (targetId, type) => {
//   setReportTarget({ id: targetId, type: type }); // type có thể là "USER" hoặc "GROUP"
//   setIsReportModalVisible(true);
// };

const handleOpenReport = (targetId, type) => {
  // Chuẩn hóa loại đối tượng trước khi truyền vào Modal
  const normalizedType = type === "GROUP" ? "CONVERSATION" : "USER";
  
  setReportTarget({ id: targetId, type: normalizedType });
  setIsReportModalVisible(true);
};

const getDisplayName = useCallback((msg) => {
  if (!msg) return "Thành viên";
  
  const isMsgMe = String(msg.senderId) === String(currentUser?.id);
  if (isMsgMe) return "Bạn";

  const originalName = msg.senderName || msg.User?.full_name || "Thành viên";
  
  // Kiểm tra nhóm trưởng
  const isOwner = selectedConversation?.isGroup && 
                  String(msg.senderId) === String(selectedConversation?.createdBy);
    
  return isOwner ? `${originalName} (nhóm trưởng)` : originalName;
}, [currentUser?.id, selectedConversation]);
const handleRemoveMember = async (userId) => {
  if (!window.confirm("Bạn có chắc chắn muốn xóa thành viên này?")) return;

  try {
    // 1. Gọi API xóa thành viên
    await removeMemberFromGroupApi(selectedConversation.id, userId);

    // 2. GỬI REALTIME CHO NGƯỜI BỊ XÓA
    const stompClient = friendSocketRef?.current;
    if (stompClient && stompClient.connected) {
      stompClient.publish({
        destination: "/app/groups/remove", // Hoặc route xử lý thông báo của bạn
        body: JSON.stringify({
          receiverId: userId,
          conversationId: selectedConversation.id,
          type: "YOU_WERE_REMOVED",
          message: "Bạn đã bị xóa khỏi nhóm.",
        }),
      });
    }

    // 3. Cập nhật UI ngay lập tức
    setSelectedConversation((prev) => ({
      ...prev,
      participants: prev.participants.filter((member) => member.id !== userId),
      memberCount: prev.memberCount - 1
    }));
    
    alert("Xóa thành viên thành công!");
    
    // 4. Load lại danh sách hội thoại để đảm bảo đồng bộ
    if (typeof fetchConversations === "function") {
      await fetchConversations();
    }

  } catch (error) {
    console.error("Lỗi xóa thành viên:", error);
    alert(error.response?.data?.message || "Có lỗi xảy ra khi xóa thành viên.");
  }
};

useEffect(() => {
    // 1. Lấy giá trị hiện tại của client
    const client = friendSocketRef?.current;

    // 2. Chỉ đăng ký khi client đã sẵn sàng
    if (client && client.connected && currentUser) {
        const subscription = client.subscribe(`/user/queue/notifications`, (msg) => {
            const notification = JSON.parse(msg.body);

            if (notification.type === "YOU_WERE_REMOVED") {
                // Hiển thị thông báo cho người dùng biết lý do
                alert(notification.message);

                // TỰ ĐỘNG RELOAD LẠI TRANG
                // Việc reload sẽ reset lại toàn bộ state, xóa bỏ nhóm bị xóa 
                // khỏi danh sách và làm sạch dữ liệu cũ.
                window.location.reload();
            }
        });

        return () => subscription.unsubscribe();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentUser]);


  if (loading)
    return <div className={styles.loadingScreen}>Đang tải ứng dụng...</div>;
  if (!user) return null;

  return (
    
    <div className={styles.appContainer}>
<div className={styles.leftSidebarWrapper}>
  {/* KHỐI TRÊN: CHỨA CẢ 2 CỘT DỌC */}
  <div className={styles.topNavigationArea}>
    

{/* CỘT 1 - DANH SÁCH NHÓM */}
<div className={styles.sideBarGroups}>

  {/* HOME */}
  <div
    className={`${styles.groupIconWrapper} ${activeTab === "ALL" ? styles.activeGroup : ""}`}
    onClick={() => {
      setActiveTab("ALL");
      setSelectedUser(null);
      setSelectedConversation(null);
    }}
  >
    <div className={styles.homeIcon}>
      <HomeFilled 
        style={{ 
          fontSize: '20px', 
          // Màu trắng nếu đang ở Trang chủ, màu đen nếu đang chọn nhóm khác
          color: activeTab === "ALL" ? '#ffffff' : '#000000' 
        }} 
      />
    </div>
    <div className={styles.groupTooltip}>Trang chủ</div>
    <div className={styles.activeIndicator} />
  </div>

  <div className={styles.groupSeparator} />

  {/* GROUP LIST */}
  <div className={styles.groupsScrollList}>
    {conversations?.filter((c) => c.type === "GROUP").map((group) => {
      const randomCount = Math.floor(Math.random() * 16); 
      const isMuted = mutedUsers[group.id];

      return (
        <div
          key={`sidebar-g-${group.id}`}
          className={`${styles.groupIconWrapper} ${selectedConversation?.id === group.id ? styles.activeGroup : ""}`}
          onClick={() => {
            // QUAN TRỌNG: Đặt activeTab về null để icon Home chuyển sang màu đen
            setActiveTab(null); 
            
            const conversationData = {
              ...group,
              isGroup: true,
              conversationId: group.id,
              full_name: group.name,
              avatar_url: group.groupAvatar || group.avatar_url,
              participants: group.participants || [] 
            };
            setSelectedConversation(conversationData);
            setSelectedUser(conversationData);
            openConversation(conversationData);
          }}
        >
          <img 
            src={group.groupAvatar || group.avatar_url || "/group-avatar.png"} 
            className={styles.groupAvatarIcon} 
            alt={group.name} 
          />
{isMuted && (
  <div className={styles.muteGroupWrapper}>
    <BellFilled
      style={{
        fontSize: "10px",
        color: "#ff4d4f",
      }}
    />
    <div className={styles.crossLineGroup} />
  </div>
)}

{!isMuted && randomCount > 0 && (
  <div
    style={{
      position: "absolute",
      bottom: "-4px",
      right: "8px",
      width: "16px",
      height: "16px",
      backgroundColor: "#ff4d4f",
      borderRadius: "100%",
      border: "2px solid black",
      zIndex: 1,
    }}
  />
)}

          <div className={styles.groupTooltip}>
            {group.name}
            <span style={{ display: 'block', fontSize: '10px', opacity: 0.8 }}>
              {group.memberCount || 0} thành viên
            </span>
          </div>

          <div className={styles.activeIndicator} />
        </div>
      );
    })}
  </div>

  {/* CREATE GROUP */}
  <div
    className={styles.groupIconWrapper}
    onClick={() => {
        setIsGroupModalOpen(true);
        // Có thể chọn giữ activeTab hiện tại hoặc set null tùy ý bạn
    }}
  >
    <div className={styles.homeIcon} style={{ color: "#23a55a", fontWeight: "bold" }}>+</div>
    <div className={styles.groupTooltip}>Tạo nhóm mới</div>
    <div className={styles.activeIndicator} />
  </div>

</div>


   {/* CỘT 2 - DANH SÁCH NHÂN SỰ/BẠN BÈ */}
<div className={styles.sideColumnLeft}>
  <div className={styles.leftSearchArea}>
    <div className={styles.searchFakeInput}>Tìm kiếm...</div>
  </div>

  <div className={`${styles.leftMenuItem} ${styles.leftMenuItemActive}`}>
    {selectedConversation?.isGroup 
      ? `Thành viên trong nhóm (${selectedConversation.memberCount || 0})` 
      : "Nhân sự"
    }
  </div>

<div className={styles.scrollableArea}>
  {selectedConversation?.isGroup ? (
    // 1. TRƯỜNG HỢP LÀ NHÓM
    (selectedConversation.participants && selectedConversation.participants.length > 0) 
      ? selectedConversation.participants.map((item) => (
          <div key={item.id} className={styles.leftItem}>
            <div className={styles.avatarContainer}>
              <img src={item.avatar_url || "/default-avatar.png"} className={styles.avatarImg} alt="avt" />
            </div>
            <div className={styles.userNames}>
              <div className={styles.currentName}>{item.full_name || item.username}</div>
              <div className={styles.currentStatus}>Thành viên</div>
            </div>
          </div>
        ))
:(selectedConversation.memberNames || []).map((name, index) => {
  const memberInfo = allUsers?.find(
    (u) => u.full_name === name || u.username === name
  );
  const avatarToDisplay = memberInfo?.avatar_url || "/default-avatar.png";

  return (
    <div
      key={index}
      className={styles.leftItem}
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "8px 0",
      }}
      onMouseEnter={() => setHoveredMember(index)}
      onMouseLeave={() => setHoveredMember(null)}
    >
      <div
        className={styles.avatarContainer}
        style={{ marginRight: "10px" }}
      >
        <img
          src={avatarToDisplay}
          className={styles.avatarImg}
          alt={name}
          onError={(e) => (e.target.src = "/default-avatar.png")}
        />
      </div>

      <div
        className={styles.userNames}
        style={{
          display: "flex",
          flex: 1,
          alignItems: "flex-start",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div
            className={styles.currentName}
            style={{
              fontWeight: "500",
              lineHeight: "20px",
            }}
          >
            {name}
          </div>

          <div
            className={styles.currentStatus}
            style={{
              fontSize: "0.85em",
              color: "#888",
              lineHeight: "18px",
            }}
          >
            Thành viên
          </div>
        </div>

        {memberInfo &&
          String(currentUser?.id) === String(selectedConversation.createdBy) &&
          String(memberInfo.id) !== String(currentUser?.id) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveMember(memberInfo.id);
              }}
              style={{
                border: "none",
                background: "transparent",
                color: "#f23f43",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "16px",
                padding: 0,
                marginLeft: "100px",
                marginTop: "-17px",
                lineHeight: "16px",

                opacity: hoveredMember === index ? 1 : 0,
                visibility: hoveredMember === index ? "visible" : "hidden",
                transform:
                  hoveredMember === index
                    ? "translateX(0)"
                    : "translateX(8px)",
                transition: "all 0.25s ease",
              }}
              title="Xóa thành viên khỏi nhóm"
            >
              ×
            </button>
          )}
      </div>
    </div>
  );
})
  ) : (
   
//     // 2. TRƯỜNG HỢP LÀ CÁ NHÂN (Friends)


friendsWithUnread.map((f) => (
  <div
    key={f.id}
    className={`${styles.leftItem} ${
      selectedUser?.id === f.id ? styles.leftItemSelected : ""
    }`}
    onClick={() => openConversation(f)}
  >
    <div className={styles.avatarContainer}>
      <img
        src={f.avatar_url || "/default-avatar.png"}
        className={styles.avatarImg}
        alt="avt"
      />
      <span className={`${styles.statusDot} ${isUserOnline(f) ? styles.statusDotOnline : styles.statusDotOffline}`} />


      {!mutedUsers[f.id] && f.unread > 0 && (
        <div className={styles.unreadBadge}>
          {f.unread > 9 ? "9+" : f.unread}
        </div>
      )}
    </div>

    <div className={styles.userNames}>
      <div className={styles.currentName}>
        {f.full_name || f.username}
      </div>

      <div className={styles.currentStatus}>
        {isUserOnline(f) ? "Đang hoạt động" : `@${f.username}`}
        

        {mutedUsers[f.id] && (
          <div className={styles.muteBellWrapper}>
            <BellFilled style={{ fontSize: '14px', color: '#ff4d4f' }} />
            <div className={styles.crossLine}></div>
          </div>
        )}
      </div>
    </div>
  </div>
))
  )}
</div>
</div>


  </div>

  <div className={styles.leftUserSection}>
  <div className={styles.userInfo}>
    <div className={styles.avatarContainer}>
      <img 
        src={user.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png"} 
        className={styles.avatarImg} 
        alt="Avatar" 
      />
      <span className={`${styles.statusDot} ${styles.statusDotOnline}`} />
    </div>
    <div className={styles.userNamesProfile}>
      <div className={styles.currentUsername}>{user.full_name || user.fullName || user.username}</div>
      <div className={styles.currentStatus}>Trực tuyến</div>
    </div>
  </div>

  <div className={styles.userActions}>
    {/* Nút Profile/Settings */}
{/* Nút Chỉnh sửa hồ sơ */}
<div 
  className={styles.actionIcon} 
  title="Chỉnh sửa hồ sơ" 
  onClick={() => setIsProfileModalOpen(true)}
  style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
> 
  <SettingOutlined style={{ fontSize: '20px' }} /> 
</div>

{/* Nút Đăng xuất */}
<div 
  className={styles.actionIcon} 
  title="Đăng xuất" 
  onClick={handleLogout}
  style={{ 
    color: '#f23f43', 
    display: 'flex', 
    alignItems: 'center', 
    cursor: 'pointer' 
  }}
>
  <LogoutOutlined style={{ fontSize: '20px' }} />
</div>
  </div>
</div>
{isProfileModalOpen && (

  <UserDetailModal
    open={isProfileModalOpen}

    onClose={() =>
      setIsProfileModalOpen(false)
    }

    user={user}

    reloadUser={reloadUser}
  />

)}



</div>
      {/* CỘT GIỮA - HIỂN THỊ THÔNG TIN TRA CỨU & CHAT */}
 <div className={styles.mainContent}>
  <header className={styles.mainHeader}>
<div className={styles.headerLeft}>
<h3 className={styles.headerText}>
  {selectedUser ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      {/* Avatar */}
      <img
        src={
          selectedUser.isGroup
            ? (selectedUser.groupAvatar || "/group-avatar.png")
            : (selectedUser.avatar_url || "/default-avatar.png")
        }
        alt="avatar"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          objectFit: 'cover',
          border: selectedUser.isGroup
            ? '2px solid #1890ff'
            : (isUserOnline(selectedUser) ? '2px solid #52c41a' : '2px solid #d9d9d9')
        }}
      />
      
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '16px', fontWeight: 'bold', lineHeight: '1.2' }}>
          {selectedUser.full_name}
        </span>

        {/* Đã thêm marginTop để đẩy dòng này xuống */}
        <span style={{
          fontSize: '10px',
          marginTop: '8px', 
          lineHeight: '1',
          color: selectedUser.isGroup
            ? '#1890ff'
            : (isUserOnline(selectedUser) ? '#52c41a' : '#8c8c8c')
        }}>
          {selectedUser.isGroup
            ? "Cộng đồng chung"
            : (isUserOnline(selectedUser) ? "● Vừa mới truy cập" : "○ Ngoại tuyến")
          }
        </span>
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <MessageOutlined /> 👋 Chào mừng!
    </div>
  )}
</h3>


</div>

{/* Nút thêm bạn bè khi ở màn hình chào mừng */}
{/* Nút Kết nối nhân sự */}
{!selectedUser && (
  <Tooltip title="Kết nối nhân sự" color="#111214" overlayInnerStyle={{ borderRadius: '8px', fontSize: '12px' }}>
    <button 
      type="button" 
      className={styles.createGroupBtn} 
      onClick={() => setIsAddFriendModalOpen(true)}
    >
      <UserAddOutlined style={{ fontSize: '20px', marginRight: '8px' }} />
      Kết nối nhân sự
    </button>
  </Tooltip>
)}




{/* Container bao ngoài các nút, sử dụng flex và margin-left: auto để đẩy sang phải */}
  {selectedUser && (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>

{/* Nút Báo cáo */}
<Tooltip 
  title="Báo cáo vi phạm" 
  color="#111214" 
  overlayInnerStyle={{ borderRadius: '8px', fontSize: '12px' }}
>
{/* <button
  type="button"
  className={styles.iconBtn}
  onClick={() => {
      handleOpenReport(selectedUser.id, "USER");
  }}
>
  <FlagOutlined style={{ fontSize: "20px" }} />
</button> */}


<button
  type="button"
  className={styles.iconBtn}
  onClick={() => {
    // Truyền vào ID và Type (type có thể là "USER" hoặc "GROUP")
    handleOpenReport(selectedUser.id, "USER"); 
  }}
>
  <FlagOutlined style={{ fontSize: "20px" }} />
</button>
</Tooltip>
{/* Modal Báo cáo */}
<ReportModal 
  visible={isReportModalVisible} 
  onClose={() => setIsReportModalVisible(false)} 
  targetId={reportTarget.id} 
  reportType={reportTarget.type}

/>

        {/*1. Thông báo */}

{/* Trong phần hiển thị Chat (khi đang có selectedUser) */}
{selectedUser && (
  <Tooltip title={mutedUsers[selectedUser.id] ? "Bật thông báo" : "Tắt thông báo"}>
    <button onClick={() => toggleMuteForUser(selectedUser.id)} className={styles.iconBtn}>
      <div className={styles.bellWrapper}>
        <BellOutlined style={{ color: mutedUsers[selectedUser.id] ? '#ff4d4f' : 'inherit' }} />
        {mutedUsers[selectedUser.id] && <div className={styles.crossine}></div>}
      </div>
    </button>
  </Tooltip>
)}


{/* 2. Ghim tin nhắn với chấm đỏ thông báo */}
<Tooltip title="Ghim tin nhắn">
  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
    <button
      type="button"
      className={styles.iconBtn}
      onClick={() => setIsPinModalOpen(true)}
      style={{ position: "relative" }}
    >
      <PushpinOutlined style={{ fontSize: "20px" }} />
    </button>

    {/* Điều kiện hiển thị chấm đỏ dựa trên State mới nhất */}
    {(selectedConversation?.hasPinnedMessages === true || pinnedMessages?.length > 0) && (
      <span
        style={{
          position: "absolute",
          top: "1px",
          right: "1px",
          width: "10px",
          height: "10px",
          backgroundColor: "#ff0000",
          borderRadius: "50%",
          border: "2px solid #2b2d31",
          zIndex: 999,
          boxShadow: "0 0 6px rgba(255,0,0,0.8)",
          animation: "pinPulse 1.5s infinite",
          pointerEvents: "none",
        }}
      />
    )}
    
    {/* Style cho animation */}
    <style>{`
      @keyframes pinPulse {
        0% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.25); opacity: 0.7; }
        100% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
</Tooltip>
        {/* 3. Nút Ẩn/Hiện hồ sơ */}
{/* 3. Nút Ẩn/Hiện hồ sơ (Phong cách icon tối giản giống chỉnh sửa hồ sơ) */}
<Tooltip 
  title={isRightSidebarVisible ? "Ẩn danh sách thành viên" : "Hiện danh sách thành viên"}
  color="#111214" // Màu nền của khung tooltip (chọn màu tối cho giống Discord)
  overlayInnerStyle={{ 
    borderRadius: '8px',   // Bo viền khung
    padding: '8px 12px',   // Khoảng cách bên trong
    fontSize: '12px',      // Kích thước chữ
    boxShadow: '0 4px 12px rgba(0,0,0,0.5)' // Đổ bóng nhẹ cho sang
  }}
>
  <button 
    type="button"
    onClick={() => setIsRightSidebarVisible(!isRightSidebarVisible)}
    style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      cursor: 'pointer',
      color: '#b5bac1',
      transition: 'all 0.2s ease',
      borderRadius: '4px'
    }}
  >
    {isRightSidebarVisible ? (
      <EyeInvisibleOutlined style={{ fontSize: '20px' }} />
    ) : (
      <EyeOutlined style={{ fontSize: '20px' }} />
    )}
  </button>
</Tooltip>
      
      {/* 4. Thanh tìm kiếm */}
{/* 4. Thanh tìm kiếm đã kết nối với state và hàm xử lý */}
<div style={{ position: 'relative', width: '100%' }}>
  {/* Icon Kính lúp */}
  <SearchOutlined 
    style={{ 
      position: 'absolute', 
      left: '12px', 
      top: '50%', 
      transform: 'translateY(-50%)', 
      color: '#b5bac1', 
      fontSize: '16px',
      pointerEvents: 'none' // Giúp click xuyên qua icon vào input
    }} 
  />
  
  {/* Input Tìm kiếm */}
  <input
    type="text"
    placeholder="Tìm trong đoạn chat..."
    className={styles.miniSearchInput}
    value={chatSearchQuery}
    onChange={handleSearchChat}
    style={{
      padding: "10px 15px 10px 35px", // Quan trọng: Tăng padding-left để chừa chỗ cho icon
      borderRadius: "6px",
      border: "1px solid #3f4147",
      backgroundColor: "#2b2d31",
      color: "#fff",
      fontSize: "14px",
      outline: "none",
      width: "100%",
      boxSizing: "border-box"
    }}
  />
</div>

   
      
    </div>
  )}
  </header>


  {/* ================= BỔ SUNG KHỐI TAB HEADER VÀO ĐÂY (KHI CHƯA CHỌN CHAT) ================= */}
        {!selectedUser && (
          <div className={styles.tabHeader} style={{ display: "flex", gap: "15px", padding: "10px 20px", borderBottom: "1px solid #3f4147" }}>
            <button 
              className={activeTab === "ALL" ? styles.activeTab : ""} 
              onClick={() => setActiveTab("ALL")}
              style={{ background: "none", border: "none", color: activeTab === "ALL" ? "#fff" : "#b5bac1", cursor: "pointer", fontWeight: "500" }}
            >
              Tất cả nhân sự
            </button>
            <button 
              className={activeTab === "PENDING" ? styles.activeTab : ""} 
              onClick={() => setActiveTab("PENDING")}
              style={{ background: "none", border: "none", color: activeTab === "PENDING" ? "#fff" : "#b5bac1", cursor: "pointer", fontWeight: "500" }}
            >
              Lời mời ({pendingRequests.length})
            </button>
            
            {/* NÚT TAB ĐÃ CHẶN MỚI BỔ SUNG */}
            <button 
              className={activeTab === "BLOCKED" ? styles.activeTab : ""} 
              onClick={() => setActiveTab("BLOCKED")}
              style={{ background: "none", border: "none", color: activeTab === "BLOCKED" ? "#fff" : "#b5bac1", cursor: "pointer", fontWeight: "500" }}
            >
              Đã chặn ({blockedList.length})
            </button>
          </div>
        )}

  {/* Thanh tìm kiếm hiển thị khi chưa chọn chat */}
  {!selectedUser && (
    <div className={styles.searchWrapper}>
      <div className={styles.searchContainer}>
        <span className={styles.searchIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Tra cứu nhân viên hoặc tên nhóm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <span className={styles.searchClear} onClick={() => setSearchQuery("")}>
            ✕
          </span>
        )}
      </div>
    </div>
  )}

  <div className={styles.chatAreaContainer}>
    {/* TRƯỜNG HỢP 1: HIỂN THỊ KẾT QUẢ TÌM KIẾM */}
    {!selectedUser && searchQuery ? (
      <div className={styles.searchResultsArea}>
        {/* Kết quả Nhân viên */}
        {searchResults.users.length > 0 && (
          <div style={{ marginBottom: "30px" }}>
            <h4 className={styles.resultSectionTitle}>
              Nhân viên tìm thấy — {searchResults.users.length}
            </h4>
            <div className={styles.resultGrid}>
              {searchResults.users.map((u) => (
                <div
                  key={`search-u-${u.id}`}
                  className={styles.searchCard}
                  onClick={() => {
                    openConversation(u);
                    setSearchQuery("");
                  }}
                >
                  <img src={u.avatar_url || "/default-avatar.png"} className={styles.searchAvatar} alt="avt" />
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: "bold" }}>{u.full_name}</div>
                    <div style={{ color: "#b5bac1", fontSize: "12px" }}>@{u.username}</div>
                    <div className={`${styles.statusLabel} ${isUserOnline(u) ? styles.online : styles.offline}`}>
                      {isUserOnline(u) ? "● Trực tuyến" : "Ngoại tuyến"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kết quả Nhóm */}
        {searchResults.groups.length > 0 && (
          // <div>
          //   <h4 className={styles.resultSectionTitle}>Nhóm tìm thấy — {searchResults.groups.length}</h4>
          //   <div className={styles.resultGrid}>
          //     {searchResults.groups.map((g) => (
          //       <div
          //         key={`search-g-${g.id}`}
          //         className={styles.searchCard}
          //         onClick={() => {
          //           openConversation(g);
          //           setSearchQuery("");
          //         }}
          //       >
          //         <div className={styles.groupIconSquare}>👥</div>
          //         <div style={{ overflow: "hidden" }}>
          //           <div style={{ fontWeight: "bold" }}>{g.name}</div>
          //           <div style={{ color: "#b5bac1", fontSize: "12px" }}>Nhóm nội bộ</div>
          //         </div>
          //       </div>
          //     ))}
          //   </div>
          // </div>
          <div>
  <h4 className={styles.resultSectionTitle}>
    <TeamOutlined style={{ marginRight: '8px' }} /> 
    Nhóm tìm thấy — {searchResults.groups.length}
  </h4>
  <div className={styles.resultGrid}>
    {searchResults.groups.map((g) => (
      <div
        key={`search-g-${g.id}`}
        className={styles.searchCard}
        onClick={() => {
          openConversation(g);
          setSearchQuery("");
        }}
      >
        {/* Thay thế emoji 👥 bằng Icon Ant Design */}
        <div className={styles.groupIconSquare}>
          <TeamOutlined style={{ fontSize: '20px' }} />
        </div>
        
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontWeight: "bold" }}>{g.name}</div>
          <div style={{ color: "#b5bac1", fontSize: "12px" }}>Nhóm nội bộ</div>
        </div>
      </div>
    ))}
  </div>
</div>
        )}
        
        {searchResults.users.length === 0 && searchResults.groups.length === 0 && (
          <div className={styles.noResult}>
            <p>Không tìm thấy kết quả cho "{searchQuery}"</p>
          </div>
        )}
      </div>
    ) : selectedUser?.conversationId ? (
      console.log("Dữ liệu conversation đang gửi cho ChatPage:", selectedConversation),
      /* TRƯỜNG HỢP 2: ĐANG TRONG CUỘC TRÒ CHUYỆN */
      <Chat
        key={selectedUser.conversationId}
        selectedConversation={{
          id: selectedUser.conversationId,
          name: selectedUser.full_name || selectedUser.fullName || selectedUser.username, // Đảm bảo không bị trống tên
          avatar_url: selectedUser.avatar_url,
          isGroup: selectedUser.isGroup,
          createdBy: selectedUser.createdBy,
          participants: conversations?.find((c) => c.id === selectedUser.conversationId)?.participants || [],
        // 🔥 BỔ SUNG DÒNG NÀY ĐỂ TRUYỀN DANH SÁCH TÊN SANG CHATPAGE
          memberNames: conversations?.find((c) => c.id === selectedUser.conversationId)?.memberNames || [],
        
        }}
        currentUser={user}
        token={token}
        friends={friends}
        
        // 🚫 ĐỒNG BỘ TRẠNG THÁI CHẶN REAL-TIME
        // isBlocked={blockedList && blockedList.some(b => String(b.id) === String(selectedUser.id))}
        isBlocked={isTargetBlockedBothWays}
        // 🤝 ĐỒNG BỘ 4 PROPS QUAN HỆ ĐỂ HIỂN THỊ BANNER CỘT GIỮA
        isNotConnected={isNotConnected}
        isPendingConnection={isPendingConnection}
        incomingRequest={incomingRequest}
        handleAcceptFriend={handleAcceptFriend}
        chatSearchQuery={chatSearchQuery}

        pinnedMessages={pinnedMessages}
  isPinModalOpen={isPinModalOpen}
  setIsPinModalOpen={setIsPinModalOpen}
  onUnpinSuccess={() => setPinTrigger(prev => prev + 1)}/>

    ) : (
      /* TRƯỜNG HỢP 3: MÀN HÌNH CHÀO MỪNG + LỜI MỜI KẾT BẠN */
/* TRƯỜNG HỢP 3: MÀN HÌNH CHÀO MỪNG + LỜI MỜI KẾT BẠN (ĐÃ TÍCH HỢP ĐIỀU KIỆN TAB) */
      <div className={styles.welcomeAreaWrapper} style={{ padding: "20px" }}>
        
        {/* --- TAB 1 & TAB 2: HIỂN THỊ LỜI MỜI KẾT BẠN ĐANG CHỜ --- */}
        {(activeTab === "ALL" || activeTab === "PENDING") && pendingRequests && pendingRequests.length > 0 && (
          <div style={{ 
            marginBottom: "40px", 
            animation: "fadeInDown 0.4s ease-out" 
          }}>
            <h4 className={styles.resultSectionTitle} style={{ 
              color: "#f2f3f5", 
              marginBottom: "16px", 
              display: "flex", 
              alignItems: "center", 
              gap: "10px",
              fontSize: "14px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              <span style={{ 
                backgroundColor: "#f23f43", 
                color: "white", 
                padding: "2px 8px", 
                borderRadius: "10px", 
                fontSize: "12px" 
              }}>
                {pendingRequests.length}
              </span> 
              LỜI MỜI KẾT NỐI ĐANG CHỜ
            </h4>

            <div className={styles.resultGrid} style={{ display: "grid", gap: "10px" }}>
              {pendingRequests.map((req) => (
                <div 
                  key={req.id} 
                  className={styles.searchCard} 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "12px", 
                    background: "#2b2d31", 
                    padding: "16px", 
                    borderRadius: "8px",
                    border: "1px solid #3f4147",
                    transition: "transform 0.2s ease"
                  }}
                >
                  {/* Avatar với trạng thái Online */}
                  <div style={{ position: "relative" }}>
                    <img
                      src={req.avatarUrl || "/default-avatar.png"}
                      alt="avt"
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                    />
                    {req.online && (
                      <div style={{
                        position: "absolute",
                        bottom: "2px",
                        right: "2px",
                        width: "12px",
                        height: "12px",
                        backgroundColor: "#23a55a",
                        borderRadius: "50%",
                        border: "3px solid #2b2d31"
                      }} />
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: "600", 
                      color: "#fff", 
                      fontSize: "15px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    }}>
                      {req.fullName || req.username || "Người dùng ẩn danh"}
                    </div>
                    <div style={{ color: "#b5bac1", fontSize: "12px", marginTop: "2px" }}>
                      @{req.username || "unknown"} • Muốn kết nối
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <button 
                      onClick={() => handleAcceptFriend(req.id)}
                      className={styles.acceptActionBtn}
                      style={{ 
                        height: "32px",
                        width: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#23a55a", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "50%", 
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      title="Chấp nhận"
                    >
                      ✔
                    </button>
                    <button 
                      onClick={() => handleDeclineFriend(req.id)}
                      className={styles.declineActionBtn}
                      style={{ 
                        height: "32px",
                        width: "32px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "#4e5058", 
                        color: "#dbdee1", 
                        border: "none", 
                        borderRadius: "50%", 
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                      title="Từ chối"
                    >
                      ✖
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: HIỂN THỊ DANH SÁCH NHÂN VIÊN ĐÃ CHẶN --- */}
        {activeTab === "BLOCKED" && (
          <div style={{ marginBottom: "40px", animation: "fadeInDown 0.4s ease-out" }}>
            <h4 className={styles.resultSectionTitle} style={{ 
              color: "#f2f3f5", 
              marginBottom: "16px", 
              fontSize: "14px", 
              textTransform: "uppercase",
              letterSpacing: "0.5px" 
            }}>
              DANH SÁCH NHÂN VIÊN ĐÃ CHẶN ({blockedList.length})
            </h4>
            {blockedList.length === 0 ? (
              <div className={styles.searchCard} style={{ color: "#b5bac1", padding: "20px", background: "#2b2d31", borderRadius: "8px", border: "1px solid #3f4147", textAlign: "center" }}>
                Danh sách chặn trống.
              </div>
            ) : (
              <div className={styles.resultGrid} style={{ display: "grid", gap: "10px" }}>
                {blockedList.map((b) => (
                  <div 
                    key={b.id} 
                    className={styles.searchCard} 
                    style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "12px", 
                      background: "#2b2d31", 
                      padding: "16px", 
                      borderRadius: "8px",
                      border: "1px solid #3f4147"
                    }}
                  >
                    <img 
                      src={b.avatarUrl || "/default-avatar.png"} 
                      alt="avt" 
                      style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} 
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "600", color: "#fff", fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {b.fullName}
                      </div>
                      <div style={{ color: "#b5bac1", fontSize: "12px", marginTop: "2px" }}>
                        @{b.username}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleUnblock(b.id)}
                      style={{ 
                        padding: "6px 16px", 
                        backgroundColor: "#248046", 
                        color: "#fff", 
                        border: "none", 
                        borderRadius: "4px", 
                        cursor: "pointer", 
                        fontWeight: "500", 
                        fontSize: "13px",
                        transition: "background 0.2s"
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = "#1a6535"}
                      onMouseOut={(e) => e.target.style.backgroundColor = "#248046"}
                    >
                      Gỡ chặn
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- BOX CHÀO MỪNG MẶC ĐỊNH (Tự động ẩn khi đang xem Tab danh sách chặn để tối ưu giao diện) --- */}
        {activeTab !== "BLOCKED" && (
          <div className={styles.welcomeBox}>
            <h1>Chào mừng, {user?.full_name || user?.username}!</h1>
            <p style={{ color: "#b5bac1" }}>
              Tìm kiếm đồng nghiệp hoặc chọn một cuộc trò chuyện để bắt đầu.
            </p>
          </div>
        )}

      </div>
    )}
  </div>
</div>

{isRightSidebarVisible && (
  <div className={styles.sideColumnRight}>
    {/* Áp dụng flex column tại đây để quản lý chiều cao và vị trí nút */}
    <div className={styles.scrollableArea} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {!selectedUser ? (
          <div>
            <h3 className={styles.rightSectionLabel}>TRỰC TUYẾN — {onlineMembers.length}</h3>
            {onlineMembers.map((u) => (
              <div key={u.id} className={styles.memberRow} onClick={() => openConversation(u)}>
                <div className={styles.avatarContainer}>
                  <img src={u.avatar_url || "/default-avatar.png"} className={styles.avatarImg} alt="avt" />
                  <span className={`${styles.statusDot} ${styles.statusDotOnline}`} />
                </div>
                <span className={styles.memberName}>{u.full_name}</span>
              </div>
            ))}
            <h3 className={styles.rightSectionLabel}>NGOẠI TUYẾN — {offlineMembers.length}</h3>
            {offlineMembers.map((u) => (
              <div key={u.id} className={styles.memberRow} onClick={() => openConversation(u)}>
                <div className={styles.avatarContainer}>
                  <img src={u.avatar_url || "/default-avatar.png"} className={styles.avatarImg} alt="avt" style={{ opacity: 0.5 }} />
                  <span className={`${styles.statusDot} ${styles.statusDotOffline}`} />
                </div>
                <span className={styles.memberName} style={{ color: "#82858f" }}>{u.full_name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.userProfileCard}>
            <div className={styles.profileBanner} style={{ backgroundColor: "#5865f2" }} />
            <div className={styles.profileBody}>
              <div className={styles.profileAvatarWrapper}>
                <img src={selectedUser.avatar_url || "/default-avatar.png"} className={styles.profileAvatar} alt="avt" />
              </div>
              <h3 className={styles.profileName}>{selectedUser.full_name}</h3>
              <p className={styles.profileUsername}>@{selectedUser.username || (selectedUser.isGroup ? "group" : "user")}</p>
              <hr className={styles.profileDivider} />

              <div className={styles.detailItem}>
                <label>VAI TRÒ</label>
                <span>{selectedUser.isGroup ? "GROUP CHAT" : selectedUser.role || "USER"}</span>
              </div>

              <div className={styles.detailItem}>
                <label>{selectedUser.isGroup ? "NGÀY TẠO NHÓM" : "NGÀY THAM GIA"}</label>
                <span>{formatDate(selectedUser.createdAt || selectedUser.created_at)}</span>
              </div>

              {selectedUser.isGroup && (
                <div className={styles.detailItem} style={{ flexDirection: "column", alignItems: "flex-start", marginTop: "10px" }}>
                  <div style={{ width: "100%", maxHeight: "150px", overflowY: "auto" }}>
                    {(selectedUser.members || []).map((m) => (
                      <div key={m.id} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                        <img src={m.avatar_url || "/default-avatar.png"} style={{ width: "20px", height: "20px", borderRadius: "50%", marginRight: "8px" }} alt="avt" />
                        <span style={{ fontSize: "12px" }}>{m.full_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedUser.isGroup && (
                <div className={styles.groupActions}>
                  <button onClick={() => window.confirm("Rời nhóm?") && handleLeaveGroup(selectedUser.id)} style={{ width: "100%", padding: "10px", backgroundColor: "#da373c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "10px" }}>Rời nhóm</button>
                  {leaveGroupStatus && <div style={{ marginTop: "5px", fontSize: "12px", textAlign: "center" }}>{leaveGroupStatus}</div>}
                </div>
              )}
              
              {!selectedUser.isGroup && String(selectedUser.id) !== String(user?.id) && (
                <>
                  {/* Logic Kết bạn */}
                  {(() => {
                    const isFriend = friends?.some(f => String(f.id) === String(selectedUser.id));
                    const req = pendingRequests?.find(r => String(r.senderId) === String(selectedUser.id) || String(r.id) === String(selectedUser.id));
                    if (isFriend) return <button onClick={() => handleUnfriend(selectedUser.id)} style={{ width: "100%", padding: "10px", backgroundColor: "#da373c", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>Hủy kết nối</button>;
                    if (req) return <button onClick={() => handleAcceptFriend(req.id)} style={{ width: "100%", padding: "10px", backgroundColor: "#5865f2", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>Chấp nhận</button>;
                    return <button onClick={async () => { await axios.post(`http://localhost:8082/api/contacts/${user.id}`, { contactUserId: selectedUser.id }, { headers: { Authorization: `Bearer ${token}` } }); fetchPending(); }} style={{ width: "100%", padding: "10px", backgroundColor: "#23a55a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>Kết nối</button>;
                    //  return <button onClick={async () => { await axios.post(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/contacts/${user.id}`, { contactUserId: selectedUser.id }, { headers: { Authorization: `Bearer ${token}` } }); fetchPending(); }} style={{ width: "100%", padding: "10px", backgroundColor: "#23a55a", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>Kết nối</button>;
                  })()}
                  {/* Logic Chặn */}
                  {(() => {
                    const isBlocked = selectedUser.isBlocked || blockedList?.some(b => String(b.id) === String(selectedUser.id));
                    return <button onClick={() => isBlocked ? handleUnblock(selectedUser.id) : handleBlock(selectedUser.id)} style={{ width: "100%", padding: "10px", backgroundColor: "transparent", color: isBlocked ? "#248046" : "#f23f43", border: `1px solid ${isBlocked ? "#248046" : "#f23f43"}`, borderRadius: "4px", cursor: "pointer", marginBottom: "10px" }}>{isBlocked ? "Gỡ chặn" : "Chặn người dùng"}</button>;
                  })()}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Nút quay lại luôn nằm cuối vì cha có flex column */}
      {selectedUser && (
        <button
          className={styles.profileBackBtn}
          onClick={() => setSelectedUser(null)}
          style={{ width: "100%", padding: "10px", backgroundColor: "#4e5058", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "500", marginTop: "10px" }}
        >
          Quay lại
        </button>
      )}
    </div>
  </div>
)}
{/* MODAL TẠO NHÓM */}
{isGroupModalOpen && (
  <div className={styles.modalOverlay}>
    <div className={styles.modalContent}>
      <button
        className={styles.modalCloseBtn}
        onClick={() => setIsGroupModalOpen(false)}
      >
        ✕
      </button>

      <h2 className={styles.modalTitle}>Tạo nhóm nội bộ</h2>
      <p className={styles.modalSubtitle}>
        Nhóm nội bộ là nơi bạn trao đổi công việc với đồng nghiệp. Hãy chọn
        thành viên để bắt đầu.
      </p>

      {/* Tên nhóm */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "18px",
          boxSizing: "border-box",
        }}
      >
        <label
          style={{
            color: "#b5bac1",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Tên nhóm
        </label>

        <input
          type="text"
          placeholder="Nhập tên nhóm của bạn..."
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#1e1f22",
            color: "#fff",
            border: "1px solid #111214",
            padding: "12px 14px",
            borderRadius: "8px",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Thêm thành viên */}
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "14px",
          boxSizing: "border-box",
        }}
      >
        <label
          style={{
            color: "#b5bac1",
            fontSize: "12px",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          Thêm thành viên
        </label>

        {selectedMembers.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              padding: "10px",
              background: "#1e1f22",
              borderRadius: "8px",
            }}
          >
            {selectedMembers.map((id) => {
              const member = allUsers.find((u) => u.id === id);
              if (!member) return null;

              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#5865f2",
                    color: "#fff",
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "12px",
                  }}
                >
                  {member.full_name || member.username}
                  <span
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={() => toggleMember(id)}
                  >
                    ✕
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <input
          type="text"
          placeholder="Tìm theo tên hoặc username..."
          value={memberSearchQuery}
          onChange={(e) => setMemberSearchQuery(e.target.value)}
          style={{
            width: "100%",
            boxSizing: "border-box",
            background: "#1e1f22",
            color: "#fff",
            border: "1px solid #111214",
            padding: "12px 14px",
            borderRadius: "8px",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Danh sách thành viên */}
      <div className={styles.discordMemberList}>
        {allUsers
          .filter((u) => u.id !== user.id)
          .filter((u) =>
            (u.full_name || u.username)
              .toLowerCase()
              .includes((memberSearchQuery || "").toLowerCase())
          )
          .sort((a, b) =>
            (a.full_name || a.username).localeCompare(
              b.full_name || b.username
            )
          )
          .map((u) => {
            const isSelected = selectedMembers.includes(u.id);

            return (
              <div
                key={u.id}
                onClick={() => toggleMember(u.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: isSelected ? "#404eed" : "#2b2d31",
                  transition: "0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#35373c";
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.background = "#2b2d31";
                }}
              >
                <img
                  src={u.avatar_url || "/default-avatar.png"}
                  alt=""
                  style={{
                    width: "42px",
                    height: "42px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      fontWeight: 500,
                      color: "#fff",
                    }}
                  >
                    {u.full_name || u.username}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#b5bac1",
                    }}
                  >
                    @{u.username}
                  </div>
                </div>

                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: isSelected ? "none" : "2px solid #72767d",
                    background: isSelected ? "#23a559" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: "bold",
                  }}
                >
                  {isSelected ? "✓" : ""}
                </div>
              </div>
            );
          })}
      </div>

      {/* Footer */}
      <div className={styles.modalFooter}>
        <button
          className={styles.btnCreate}
          onClick={handleCreateGroup}
          disabled={!groupName || selectedMembers.length === 0}
        >
          Tạo nhóm ngay
        </button>

        <button
          className={styles.btnBack}
          onClick={() => setIsGroupModalOpen(false)}
        >
          Quay lại
        </button>
      </div>
    </div>
  </div>
)}
<AddFriendModal
  isOpen={isAddFriendModalOpen}
  onClose={() => setIsAddFriendModalOpen(false)}
  user={user}
  token={token}
  allUsers={allUsers}
  friends={friends}
  pendingRequests={pendingRequests}
  sentRequests={sentRequests} // Dùng để hiển thị trạng thái "Đã gửi" trong modal
  onFriendRequestSent={handleFriendRequestSent} // Kết nối Modal với hàm xử lý ở trên
/>

{isPinModalOpen && (
  <PinModal 
    isOpen={isPinModalOpen}
    onClose={() => setIsPinModalOpen(false)}
    pinnedMessages={pinnedMessages}
  />
)}
    </div>
  );
}
