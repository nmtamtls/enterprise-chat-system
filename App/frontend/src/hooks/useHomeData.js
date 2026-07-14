import { useState, useEffect,
         useCallback,
         useMemo } from "react";

import axios from "axios";

const BASE_URL = "http://localhost:8082/api";
// const BASE_URL = "https://tqgwvv8g-8082.asse.devtunnels.ms/api";
const DEFAULT_AVATAR =
  "https://cdn.discordapp.com/embed/avatars/0.png";

export const useHomeData = (token) => {

  // =====================================================
  // STATE
  // =====================================================

  const [user, setUser] = useState(null);

  const [friends, setFriends] = useState([]);

  const [allUsers, setAllUsers] = useState([]);

  const [loading, setLoading] = useState(true);




  // =====================================================
  // AXIOS CONFIG
  // =====================================================


const authConfig = useMemo(() => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
}), [token]);



  // =====================================================
  // NORMALIZE USER
  // =====================================================

  const normalizeUser = (u) => ({
    ...u,

    avatar_url:
      u.avatarUrl ||
      u.avatar_url ||
      DEFAULT_AVATAR,

    avatarUrl:
      u.avatarUrl ||
      u.avatar_url ||
      DEFAULT_AVATAR,

    full_name:
      u.fullName ||
      u.full_name ||
      u.username,

    fullName:
      u.fullName ||
      u.full_name ||
      u.username,

    isActuallyOnline:
      u.status === "active" ||
      u.online === true,
  });

  // =====================================================
  // FETCH FRIENDS
  // =====================================================

  const fetchFriends = useCallback(async () => {

    if (!token) return;

    try {

      const friendsRes = await axios.get(
        `${BASE_URL}/users`,
        authConfig
      );

      const normalizedFriends =
        (friendsRes.data.data || []).map((u) => ({
          ...normalizeUser(u),
          isFriend: true,
        }));

      setFriends(normalizedFriends);

    } catch (err) {

      console.error("Lỗi fetch friends:", err);
    }

  }, [token, authConfig]);

  // =====================================================
  // FETCH CURRENT USER
  // =====================================================

  const fetchCurrentUser = useCallback(async () => {

    if (!token) return;

    try {

      const res = await axios.get(
        `${BASE_URL}/users/me`,
        authConfig
      );

      setUser(normalizeUser(res.data.data));

    } catch (err) {

      console.error("Lỗi fetch current user:", err);
    }

  }, [token, authConfig]);

  // =====================================================
  // FETCH ALL DATA
  // =====================================================

  const fetchData = useCallback(async () => {

    if (!token) {
      setLoading(false);
      return;
    }

    try {

      const [meRes, friendsRes, allRes] =
        await Promise.all([

          axios.get(
            `${BASE_URL}/users/me`,
            authConfig
          ),

          axios.get(
            `${BASE_URL}/users`,
            authConfig
          ),

          axios.get(
            `${BASE_URL}/users/all`,
            authConfig
          ),
        ]);

      // =================================================
      // NORMALIZE FRIENDS
      // =================================================

      const normalizedFriends =
        (friendsRes.data.data || []).map((u) => ({
          ...normalizeUser(u),
          isFriend: true,
        }));

      // =================================================
      // NORMALIZE ALL USERS
      // =================================================

      const normalizedAll =
        (allRes.data.data || []).map(normalizeUser);

      // =================================================
      // SET STATE
      // =================================================

      setUser(normalizeUser(meRes.data.data));

      setFriends(normalizedFriends);

      setAllUsers(normalizedAll);

    } catch (err) {

      console.error("Lỗi khi tải dữ liệu:", err);

    } finally {

      setLoading(false);
    }

  }, [token, authConfig]);

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    fetchData();

  }, [fetchData]);

  // Thêm vào trong useHomeData, sau useEffect của fetchData
useEffect(() => {
  if (!user || !window.stompClient) return; // Đảm bảo đã có user và stompClient

  // Subscribe vào topic cá nhân (mỗi user có 1 topic riêng)
  const subscription = window.stompClient.subscribe(
    `/topic/profile-updates/${user.username}`,
    (message) => {
      const updatedProfile = JSON.parse(message.body);
      const normalized = normalizeUser(updatedProfile);

      // 1. Nếu là chính mình -> Cập nhật state 'user'
      if (updatedProfile.id === user.id) {
        setUser(normalized);
      }

      // 2. Nếu là bạn bè -> Cập nhật state 'friends'
      setFriends((prevFriends) =>
        prevFriends.map((f) => (f.id === updatedProfile.id ? normalized : f))
      );
      
      // 3. (Tuỳ chọn) Cập nhật trong allUsers nếu cần
      setAllUsers((prevAll) =>
        prevAll.map((u) => (u.id === updatedProfile.id ? normalized : u))
      );
    }
  );

  return () => subscription.unsubscribe();
}, [user]); // Chạy lại khi user thay đổi (đăng nhập thành công)

  // =====================================================
  // RETURN
  // =====================================================

  return {

    user,

    friends,

    allUsers,

    loading,

    fetchFriends,

    fetchCurrentUser,

    reloadUser: fetchCurrentUser,

    reloadAll: fetchData,

    setUser,
    setFriends,
    setAllUsers,
  };
};



