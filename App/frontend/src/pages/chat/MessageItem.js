
// src/pages/chat/MessageItem.js

import React, {
  memo,
  useState,
  useEffect,
  useRef,
} from "react";

import {
  formatFileSize,
  getMessageType,
} from "../../utils/formatFile";

import {
  decryptFile,
  importKey,
} from "../../utils/cryptoFile";

import MessageStatus from "../../components/chat/MessageStatus";
// import ReactionDisplay from '../../components/chat/ReactionDisplay';
// import ReactionPicker from '../../components/chat/ReactionPicker';
const defaultAvatar =
  "https://cdn.discordapp.com/embed/avatars/0.png";

// =====================================================
// DECRYPTED IMAGE
// =====================================================

const DecryptedImage = memo(
  ({ fileUrl, msg, styles }) => {
    const [src, setSrc] = useState(null);

    const blobUrlRef = useRef(null);

    useEffect(() => {
      let isMounted = true;

      const loadMedia = async () => {
        try {
          const isImage =
            msg.fileType?.startsWith(
              "image/"
            );

          // =========================================
          // IMAGE KHÔNG GIẢI MÃ
          // =========================================

          if (isImage) {
            if (isMounted) {
              setSrc(fileUrl);
            }

            return;
          }

          // =========================================
          // FILE THƯỜNG
          // =========================================

          if (!msg.encrypted || !msg.iv) {
            if (isMounted) {
              setSrc(fileUrl);
            }

            return;
          }

          // =========================================
          // FILE MÃ HÓA
          // =========================================

          const response =
            await fetch(fileUrl);

          const encryptedBlob =
            await response.blob();

          const savedKey =
            localStorage.getItem(
              `file-key-${msg.conversationId}`
            );

          if (!savedKey) return;

          const aesKey =
            await importKey(savedKey);

          const iv =
            typeof msg.iv === "string"
              ? JSON.parse(msg.iv)
              : msg.iv;

          const decryptedBlob =
            await decryptFile(
              encryptedBlob,
              aesKey,
              iv,
              msg.fileType
            );

          if (!blobUrlRef.current) {
            blobUrlRef.current =
              URL.createObjectURL(
                decryptedBlob
              );
          }

          if (isMounted) {
            setSrc(blobUrlRef.current);
          }
        } catch (err) {
          console.error(
            "Lỗi xử lý media:",
            err
          );
        }
      };

      loadMedia();

      return () => {
        isMounted = false;

        // 🔥 FIX MEMORY LEAK
        if (blobUrlRef.current) {
          URL.revokeObjectURL(
            blobUrlRef.current
          );

          blobUrlRef.current = null;
        }
      };
    }, [fileUrl, msg]);

    if (!src) {
      return (
        <div
          style={{
            ...styles,
            backgroundColor: "#eee",
          }}
        >
          Đang tải...
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={
          msg.fileName || "Chat image"
        }
        style={styles}
        onClick={() =>
          window.open(src, "_blank")
        }
      />
    );
  }
);

// // =====================================================
// // MESSAGE ITEM
// // =====================================================

// const renderMessageContent = (msg, currentUserName) => {
//   const { content, text, mentions } = msg;
//   const messageText = content || text || "";

//   // 1. Ưu tiên dùng logic từ 'mentions' (Giữ nguyên vì đây là cách chuẩn nhất)
//   if (mentions && mentions.length > 0) {
//     let lastIndex = 0;
//     const elements = [];

//     // Sắp xếp mentions theo thứ tự start để tránh lỗi đè dữ liệu
//     [...mentions].sort((a, b) => a.start - b.start).forEach((mention, index) => {
//       elements.push(messageText.slice(lastIndex, mention.start));
      
//       const tagText = messageText.slice(mention.start, mention.end);
//       const isMe = tagText.trim() === `@${currentUserName}`;
      
//       elements.push(
//         <span key={index} style={{ color: isMe ? '#ff3333' : '#00a8fc', fontWeight: 'bold' }}>
//           {tagText}
//         </span>
//       );
//       lastIndex = mention.end;
//     });
//     elements.push(messageText.slice(lastIndex));
//     return <>{elements}</>;
//   }

//   // 2. Fallback: Dùng Regex giới hạn (Regex này chỉ bắt tối đa 3 từ sau @ để tránh bắt cả câu)
//   // Giải thích: @ theo sau là chữ cái/số, cho phép 1 khoảng trắng giữa các từ, 
//   // dừng lại khi gặp ký tự lạ hoặc quá nhiều khoảng trắng
//   const parts = messageText.split(/(@[\p{L}0-9]+(?:\s[\p{L}0-9]+){0,3})/gu);
  
//   return (
//     <>
//       {parts.map((part, index) => {
//         if (part.startsWith('@')) {
//           const isMe = part.trim() === `@${currentUserName}`;
//           return (
//             <span key={index} style={{ color: isMe ? '#ff3333' : '#00a8fc', fontWeight: 'bold' }}>
//               {part}
//             </span>
//           );
//         }
//         return <span key={index}>{part}</span>;
//       })}
//     </>
//   );
// };


const renderMessageContent = (msg, currentUserName, conversationMembers = []) => {
  const { content, text, mentions } = msg;
  const messageText = content || text || "";

  // Helper để tạo style luôn hiển thị màu
  const getMentionStyle = (isMe) => ({
    color: '#00a8fc',
    fontWeight: 'bold',
    fontStyle: 'italic',
    cursor: 'pointer',
    backgroundColor: isMe ? 'rgba(111, 0, 255, 0.1)' : 'transparent', // Thêm nền nhẹ nếu muốn nổi bật hơn
    padding: '0 2px',
    borderRadius: '4px'
  });

  // 1. Ưu tiên logic từ 'mentions' nếu Backend gửi về
  if (mentions && Array.isArray(mentions) && mentions.length > 0) {
    let lastIndex = 0;
    const elements = [];

    [...mentions].sort((a, b) => a.start - b.start).forEach((mention, index) => {
      elements.push(messageText.slice(lastIndex, mention.start));
      const tagText = messageText.slice(mention.start, mention.end);
      const isMe = tagText.trim() === `@${currentUserName}`;
      
      elements.push(
        <span key={`m-${index}`} style={getMentionStyle(isMe)}>
          {tagText}
        </span>
      );
      lastIndex = mention.end;
    });
    elements.push(messageText.slice(lastIndex));
    return <>{elements}</>;
  }

  // 2. Fallback: Dùng danh sách thành viên để quét nếu Backend không gửi 'mentions'
  if (conversationMembers && conversationMembers.length > 0) {
    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sortedMembers = [...conversationMembers].sort((a, b) => b.fullName.length - a.fullName.length);
    const pattern = new RegExp(`(@(${sortedMembers.map(m => escapeRegExp(m.fullName)).join('|')}))`, 'gu');
    
    const parts = messageText.split(pattern);
    return (
      <>
        {parts.map((part, index) => {
          if (part && part.startsWith('@')) {
            const isMe = part.trim() === `@${currentUserName}`;
            return <span key={`f-${index}`} style={getMentionStyle(isMe)}>{part}</span>;
          }
          return <span key={`f-${index}`}>{part}</span>;
        })}
      </>
    );
  }

  // 3. Fallback cuối cùng: Chỉ hiển thị text thuần nếu không có dữ liệu hỗ trợ
  return <span>{messageText}</span>;
};

function MessageItem({
  msg,
  isMe,
  currentUser,
  avatar,
  isOnline,
  senderName,
  isGroupChat,
  styles,
  isEdited: propIsEdited,
  copiedMessageId,
  onReplyClick,
  onSendReaction,
}) {
  const isCopied =
    copiedMessageId === msg.id;

//   const [showPicker, setShowPicker] = useState(false);
//   const handleReactionClick = (emojiData) => {
//   // Gọi hàm được truyền từ ChatPage qua props
//   onSendReaction(emojiData.emoji, "ADD");
//   setShowPicker(false);
// };

  const currentType =
    msg.messageType ||
    getMessageType(
      null,
      msg.fileName
    );

  const isImage =
    currentType === "IMAGE";

  const isVideo =
    currentType === "VIDEO";

  const realtimeStatus =
    msg.status ||
    (msg.is_read
      ? "read"
      : msg.is_delivered
      ? "delivered"
      : "sent");

  const displayTime =
    msg.formattedTime
      ? msg.formattedTime
      : msg.createdAt ||
        msg.timestamp
      ? new Date(
          msg.createdAt ||
            msg.timestamp
        ).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "...";

  const hasBeenEdited =
    propIsEdited === true ||
    msg.isEdited === true ||
    msg.is_edited === true;

  const shouldShowName =
    isGroupChat && !isMe;

  // =====================================================
  // DOWNLOAD FILE
  // =====================================================

  const handleDownloadFile =
    async () => {
      try {
        const response =
          await fetch(msg.fileUrl);

        if (!response.ok) {
          throw new Error(
            "Không tải được file"
          );
        }

        const blob =
          await response.blob();

        // =========================================
        // FILE THƯỜNG
        // =========================================

        if (
          !msg.encrypted ||
          !msg.iv
        ) {
          downloadBlob(
            blob,
            msg.fileName ||
              "downloaded_file"
          );

          return;
        }

        // =========================================
        // FILE MÃ HÓA
        // =========================================

        const savedKey =
          localStorage.getItem(
            `file-key-${msg.conversationId}`
          );

        if (!savedKey) {
          alert(
            "Không tìm thấy khóa giải mã"
          );

          return;
        }

        const aesKey =
          await importKey(savedKey);

        let ivInput;

        try {
          ivInput =
            typeof msg.iv ===
            "string"
              ? JSON.parse(msg.iv)
              : msg.iv;
        } catch (e) {
          console.error(
            "Lỗi parse IV:",
            e
          );

          alert(
            "IV không hợp lệ"
          );

          return;
        }

        const decryptedBlob =
          await decryptFile(
            blob,
            aesKey,
            ivInput,
            msg.fileType ||
              "application/octet-stream"
          );

        downloadBlob(
          decryptedBlob,
          msg.fileName || "file"
        );
      } catch (err) {
        console.error(
          "Decrypt lỗi:",
          err
        );

        alert(
          "Không thể giải mã/tải file"
        );
      }
    };

  // =====================================================
  // DOWNLOAD HELPER
  // =====================================================

  const downloadBlob = (
    blob,
    fileName
  ) => {
    const blobUrl =
      URL.createObjectURL(blob);

    const a =
      document.createElement("a");

    a.href = blobUrl;
    a.download = fileName;

    document.body.appendChild(a);

    a.click();

    a.remove();

    setTimeout(() => {
      URL.revokeObjectURL(
        blobUrl
      );
    }, 3000);
  };

  // =====================================================

  return (
    <div
      id={`msg-${msg.id}`}
      style={styles.messageRow(
        isMe
      )}
    >
      {/* ===================================== */}
      {/* AVATAR LEFT */}
      {/* ===================================== */}

      {!isMe && (
        <div style={styles.avatarWrap}>
          <img
            src={
              avatar ||
              defaultAvatar
            }
            style={styles.avatar}
            alt="avatar"
          />

          {isOnline && (
            <span
              style={
                styles.onlineDot
              }
            />
          )}
        </div>
      )}

      {/* ===================================== */}
      {/* CONTENT */}
      {/* ===================================== */}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isMe
            ? "flex-end"
            : "flex-start",
          maxWidth: "75%",
        }}
      >
        {/* ================================= */}
        {/* GROUP NAME */}
        {/* ================================= */}

        {shouldShowName && (
          <div
            style={{
              fontSize: "12px",
              color: "#b5bac1",
              marginBottom: "4px",
              marginLeft: "8px",
              fontWeight: "600",
            }}
          >
            {senderName}
          </div>
        )}

          {/* ================================= */}
          {/* MESSAGE BUBBLE */}
          {/* ================================= */}

          <div
            style={{
              ...styles.bubble(isMe),

              // 🔥 HIGHLIGHT PIN
              border: msg.isPinned
                ? "1px solid #f0b232"
                : undefined,

              boxShadow:
                msg.isPinned
                  ? "0 0 0 1px rgba(240,178,50,0.25)"
                  : "none",
            }}
          >
            {/* ============================= */}
            {/* PIN BADGE */}
            {/* ============================= */}

            {msg.isPinned && (
              <div
                style={{
                  fontSize: "11px",
                  color: "#f0b232",
                  fontWeight: "600",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                Tin nhắn đã ghim
              </div>
            )}

            {/* ============================= */}
            {/* REPLY */}
            {/* ============================= */}

  {msg.repliedMessage && (
    <div
      onClick={() =>
        onReplyClick?.(msg.repliedMessage.id)
      }
      style={{
        backgroundColor: "rgba(0,0,0,0.1)",
        borderLeft: "3px solid #7289da",
        padding: "5px 10px",
        marginBottom: "8px",
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "12px",
      }}
    >
      <div style={{ fontWeight: "bold" }}>
        {msg.repliedMessage.senderName || "Người dùng"}
      </div>

      <div
        style={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          opacity: 0.85,
        }}
      >
        {(() => {
          const r = msg.repliedMessage;

          // ==============================
          // 1. TRY PARSE JSON (QUAN TRỌNG)
          // ==============================
          let parsed = null;
          try {
            parsed =
              typeof r.content === "string" &&
              r.content.startsWith("{")
                ? JSON.parse(r.content)
                : null;
          } catch (e) {
            parsed = null;
          }

          // ==============================
          // 2. IF ENCRYPTED FILE MESSAGE
          // ==============================
          if (parsed?.encrypted) {
            return " Tin nhắn tệp (đã mã hóa)";
          }

          // ==============================
          // 3. NORMAL TEXT
          // ==============================
          if (r.content && !parsed) {
            return r.content;
          }

          // ==============================
          // 4. FALLBACK
          // ==============================
          return "Tin nhắn hệ thống";
        })()}
      </div>
    </div>
  )}

            {/* {msg.repliedMessage && (
              <div
                onClick={() =>
                  onReplyClick?.(
                    msg
                      .repliedMessage
                      .id
                  )
                }
                style={{
                  backgroundColor:
                    "rgba(0,0,0,0.1)",

                  borderLeft:
                    "3px solid #7289da",

                  padding:
                    "5px 10px",

                  marginBottom: "8px",

                  borderRadius: "4px",

                  cursor: "pointer",

                  fontSize: "12px",
                }}
              >
                <div
                  style={{
                    fontWeight:
                      "bold",
                  }}
                >
                  {
                    msg
                      .repliedMessage
                      .senderName
                  }
                </div>

                <div
                  style={{
                    whiteSpace:
                      "nowrap",

                    overflow:
                      "hidden",

                    textOverflow:
                      "ellipsis",
                  }}
                >
                  {
                    msg
                      .repliedMessage
                      .content
                  }
                </div>
              </div>
            )} */}
            

            {/* ============================= */}
            {/* TEXT */}
            {/* ============================= */}

            {/* {msg.content && (
              <div
                style={{
                  whiteSpace:
                    "pre-wrap",

                  wordBreak:
                    "break-word",

                  marginBottom:
                    msg.fileUrl
                      ? 8
                      : 0,
                }}
              >
                {msg.content}
              </div>
            )} */}

            {msg.content && (
  <div
    style={{
      whiteSpace: "pre-wrap",
      wordBreak: "break-word",
      marginBottom: msg.fileUrl ? 8 : 0,
    }}
  >
    {renderMessageContent(msg, currentUser?.full_name)}
  </div>
)}

            {/* ============================= */}
            {/* IMAGE */}
            {/* ============================= */}

            {isImage &&
              msg.fileUrl && (
                <DecryptedImage
                  fileUrl={
                    msg.fileUrl
                  }
                  msg={msg}
                  styles={
                    styles.imagePreview
                  }
                />
              )}

            {/* ============================= */}
            {/* VIDEO */}
            {/* ============================= */}

            {isVideo &&
              msg.fileUrl && (
                <video
                  controls
                  style={{
                    maxWidth:
                      "260px",

                    borderRadius:
                      "8px",

                    marginTop:
                      "6px",
                  }}
                >
                  <source
                    src={
                      msg.fileUrl
                    }
                  />
                </video>
              )}

            {/* ============================= */}
            {/* FILE */}
            {/* ============================= */}

            {msg.fileUrl &&
              !isImage &&
              !isVideo && (
                <div
                  style={
                    styles.fileContent
                  }
                >
                  <div
                    style={
                      styles.fileBox
                    }
                  >
                    <div
                      style={
                        styles.fileInfo
                      }
                    >
                      <span
                        style={{
                          fontSize: 24,
                        }}
                      >
                        📄
                      </span>

                      <div
                        style={
                          styles.fileTextGroup
                        }
                      >
                        <span
                          style={
                            styles.fileNameText
                          }
                        >
                          {msg.fileName ||
                            "Tài liệu"}
                        </span>

                        <span
                          style={
                            styles.fileSizeText
                          }
                        >
                          {msg.fileSize
                            ? formatFileSize(
                                msg.fileSize
                              )
                            : ""}
                        </span>

                        {msg.encrypted &&
                          msg.iv && (
                            <span
                              style={{
                                fontSize:
                                  "10px",

                                color:
                                  "#23a55a",

                                marginTop:
                                  "2px",

                                fontWeight:
                                  "600",
                              }}
                            >
                              🔐 Đã mã hóa
                            </span>
                          )}
                      </div>
                    </div>

                    <button
                      onClick={(
                        e
                      ) => {
                        e.stopPropagation();

                        handleDownloadFile();
                      }}
                      style={{
                        border:
                          "none",

                        background:
                          "transparent",

                        color:
                          "#00a8fc",

                        cursor:
                          "pointer",

                        fontWeight:
                          "600",
                      }}
                    >
                      Tải xuống
                    </button>
                  </div>
                </div>
              )}


{/* 🔥 ĐẶT Ở ĐÂY: NGAY SAU NỘI DUNG, TRƯỚC TIME/STATUS */}
  {msg.reactions && Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
    <div style={styles.reactionsContainer(isMe)}>
      {msg.reactions.map((r, index) => (
        <span key={index} style={{ display: 'inline-block', lineHeight: 1 }}>
          {typeof r === 'object' ? r.emoji : r}
        </span>
      ))}
    </div>
  )}

      {/* ================================================= */}

            {/* ============================= */}
            {/* TIME + STATUS */}
            {/* ============================= */}

            <div
              style={{
                ...styles.timestamp(
                  isMe
                ),

                display: "flex",

                alignItems:
                  "center",

                gap: "4px",
              }}
            >
              <span>
                {displayTime}
              </span>

              {isMe && (
                <MessageStatus
                  status={
                    realtimeStatus
                  }
                />
              )}
            </div>

            {/* 🔥 PHẦN REACTION (Neo góc dưới) */}

          </div>

        {/* ================================= */}
        {/* EDITED + COPIED */}
        {/* ================================= */}

        {(hasBeenEdited ||
          isCopied) && (
          <div
            style={{
              display: "flex",

              alignItems:
                "center",

              gap: "8px",

              fontSize: "10px",

              marginTop: "3px",

              marginRight:
                isMe
                  ? "8px"
                  : "0px",

              marginLeft:
                !isMe
                  ? "8px"
                  : "0px",

              flexDirection:
                isMe
                  ? "row-reverse"
                  : "row",
            }}
          >
            {hasBeenEdited && (
              <span
                style={{
                  color:
                    "#949ba4",

                  fontStyle:
                    "italic",
                }}
              >
                (đã chỉnh sửa)
              </span>
            )}

            {isCopied && (
              <span
                style={{
                  color:
                    "#23a55a",

                  fontWeight:
                    "600",

                  backgroundColor:
                    "rgba(35,165,90,0.12)",

                  padding:
                    "1px 6px",

                  borderRadius:
                    "3px",
                }}
              >
                ✓ Đã sao chép
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===================================== */}
      {/* AVATAR RIGHT */}
      {/* ===================================== */}

      {isMe && (
        <div style={styles.avatarWrap}>
          <img
            src={
              avatar ||
              defaultAvatar
            }
            style={styles.avatar}
            alt="avatar"
          />
        </div>
      )}
    </div>
  );
}

export default memo(MessageItem);