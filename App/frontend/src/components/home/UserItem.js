// import React from "react";
// import styles from "../../pages/Home.module.css"; 

// export default function UserItem({ user, isOnline, isSelected, onClick, type = "left" }) {
//   // Nếu là item bên cột trái (inbox) thì dùng style khác, cột phải (member list) dùng style khác
//   const itemClass = type === "left" 
//     ? `${styles.leftItem} ${isSelected ? styles.leftItemSelected : ""}` 
//     : styles.memberRow;

//   return (
//     <div className={itemClass} onClick={onClick}>
//       <div className={styles.avatarContainer}>
//         <img 
//           src={user.avatar_url} 
//           className={styles.avatarImg} 
//           style={type === "right" ? { filter: isOnline ? "none" : "grayscale(80%)", opacity: isOnline ? 1 : 0.6 } : {}}
//           alt="avatar" 
//         />
//         <span className={`${styles.statusDot} ${isOnline ? styles.statusDotOnline : styles.statusDotOffline}`} />
//       </div>
      
//       {type === "left" ? (
//         <div className={styles.itemInfo}>
//           <div className={styles.displayName}>{user.full_name}</div>
//           <div className={styles.subName}>@{user.username}</div>
//         </div>
//       ) : (
//         <span style={{ color: isOnline ? "#dbdee1" : "#82858f", fontSize: "14px", fontWeight: "500", marginLeft: "12px" }}>
//           {user.full_name}
//         </span>
//       )}
//     </div>
//   );
// }