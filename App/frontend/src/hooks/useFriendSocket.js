





import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

export const useFriendSocket = (
  user,
  onReceiveFriendRequest
) => {

  const stompClientRef = useRef(null);

  // 🔥 Giữ callback mới nhất
  const callbackRef = useRef(
    onReceiveFriendRequest
  );

  // =====================================================
  // UPDATE CALLBACK MỚI NHẤT
  // =====================================================
  useEffect(() => {

    callbackRef.current =
      onReceiveFriendRequest;

  }, [onReceiveFriendRequest]);

  // =====================================================
  // SOCKET CONNECTION
  // =====================================================
  useEffect(() => {

    if (!user?.id) return;

    console.log(
      "🔌 Khởi tạo Friend Socket cho User ID:",
      user.id
    );

    const socket = new SockJS(
      `http://localhost:8082/ws?userId=${user.id}`
      // `https://tqgwvv8g-8082.asse.devtunnels.ms/ws?userId=${user.id}`
    );

    const client = new Client({

      webSocketFactory: () => socket,

      reconnectDelay: 5000,

      // 🔥 chống chết socket ngầm
      heartbeatIncoming: 4000,

      heartbeatOutgoing: 4000,

      // =================================================
      // CONNECT SUCCESS
      // =================================================
      onConnect: () => {

        console.log(
          "✅ Friend socket connected successfully"
        );

        // =============================================
        // 1. NOTIFICATIONS
        // =============================================
        client.subscribe(
          "/user/queue/notifications",
          (message) => {

            try {

              const data = JSON.parse(
                message.body
              );

              // 🔥 DEBUG GROUP REALTIME
              if (data.type === "GROUP") {

                console.log(
                  "🔥 GROUP REALTIME RECEIVED:",
                  data
                );
              }

              console.log(
                "📩 Notification via Socket:",
                data
              );

              // 🔥 callback về Home.js
              if (callbackRef.current) {
                callbackRef.current(data);
              }

            } catch (err) {

              console.error(
                "❌ Lỗi parse notification socket:",
                err
              );

            }

          }
        );

        // =============================================
        // 2. PROFILE REALTIME
        // =============================================
        client.subscribe(
          "/topic/profile-updates",
          (message) => {

            try {

              const payload = JSON.parse(
                message.body
              );

              console.log(
                "👤 Profile update via socket:",
                payload
              );

              // 🔥 chuẩn hóa gửi về Home.js
              if (callbackRef.current) {

                callbackRef.current({

                  type: "PROFILE_UPDATED",

                  data:
                    payload.data ||
                    payload,

                });
              }

            } catch (err) {

              console.error(
                "❌ Lỗi parse profile update socket:",
                err
              );

            }

          }
        );

        // =============================================
        // 3. GROUP UPDATE REALTIME
        // =============================================
        client.subscribe(
          "/user/queue/group-update",
          (message) => {

            try {

              const data = JSON.parse(
                message.body
              );

              console.log(
                "🔥 GROUP UPDATE REALTIME:",
                data
              );

              // 🔥 gửi về Home.js
              if (callbackRef.current) {

                callbackRef.current({

                  type: "GROUP_UPDATED",

                  data,

                });
              }

            } catch (err) {

              console.error(
                "❌ Lỗi parse group update socket:",
                err
              );

            }

          }
        );

      },

      // =================================================
      // STOMP ERROR
      // =================================================
      onStompError: (frame) => {

        console.error(
          "❌ STOMP Error:",
          frame
        );

      },

      // =================================================
      // WEBSOCKET ERROR
      // =================================================
      onWebSocketError: (err) => {

        console.error(
          "❌ WebSocket Error:",
          err
        );

      },

    });

    // =====================================================
    // ACTIVATE SOCKET
    // =====================================================
    client.activate();

    stompClientRef.current = client;

    // =====================================================
    // CLEANUP
    // =====================================================
    return () => {

      console.log(
        "🔌 Ngắt kết nối Friend Socket cũ"
      );

      client.deactivate();

    };

  }, [user?.id]);

  return stompClientRef;
};