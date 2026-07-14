// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import axios from "axios";
// import "../../styles/AdminDashboard.css";

// export default function AdminDashboard() {
//   const [active, setActive] = useState("dashboard");
//   const [users, setUsers] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [stats, setStats] = useState({
//     totalUsers: 0,
//     totalMessages: 0,
//     totalFiles: 0,
//     totalConversations: 0,
//   });

//   const [sortConfig, setSortConfig] = useState({
//     key: "createdAt",
//     direction: "desc",
//   });

//   // ================= LOAD DATA =================
//   const fetchData = useCallback(async () => {
//     const token = localStorage.getItem("token");
    
//     if (!token) {
//       if (window.location.pathname !== "/login") {
//         window.location.href = "http://localhost:3001/login";
//       }
//       return;
//     }

//     const headers = { Authorization: `Bearer ${token}` };

//     try {
//       const [statsRes, userRes, msgRes, fileRes] = await Promise.all([
//         axios.get("http://localhost:8082/api/admin/dashboard", { headers }),
//         axios.get("http://localhost:8082/api/users/all", { headers }),
//         axios.get("http://localhost:8082/api/messages", { headers }),
//         axios.get("http://localhost:8082/api/files/all", { headers }),
//       ]);

//       if (statsRes.data.success) setStats(statsRes.data.data);
//       setUsers(userRes.data.data || []);
//       setMessages(msgRes.data.data || []);
//       setFiles(fileRes.data.data || []);
//     } catch (err) {
//       console.error("Load data error:", err);
//       if (err.response?.status === 401) {
//         localStorage.clear();
//         window.location.href = "http://localhost:3001/login";
//       }
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   // ================= LOGIC SẮP XẾP =================
//   const requestSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortData = useCallback((data) => {
//     if (!sortConfig.key) return data;
//     return [...data].sort((a, b) => {
//       let aValue = a[sortConfig.key];
//       let bValue = b[sortConfig.key];

//       if (sortConfig.key === "size") {
//         aValue = a.size || a.fileSize || 0;
//         bValue = b.size || b.fileSize || 0;
//       }

//       if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//       if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//       return 0;
//     });
//   }, [sortConfig]); 

//   // Memoize dữ liệu đã sắp xếp
//   const sortedUsers = useMemo(() => sortData(users), [users, sortData]);
//   const sortedMessages = useMemo(() => sortData(messages), [messages, sortData]);
//   const sortedFiles = useMemo(() => sortData(files), [files, sortData]);

//   const formatDateTime = (dateStr) => {
//     if (!dateStr) return "N/A";
//     return new Date(dateStr).toLocaleString("vi-VN", {
//       hour: "2-digit",
//       minute: "2-digit",
//       day: "2-digit",
//       month: "2-digit",
//       year: "numeric",
//     });
//   };

//   // Render Table Functions
//   const renderUsers = () => (
//     <table className="dbTable">
//       <thead>
//         <tr>
//           <th onClick={() => requestSort("id")} className="sortable">ID ↕</th>
//           <th onClick={() => requestSort("username")} className="sortable">Username ↕</th>
//           <th>Email</th>
//           <th>Role</th>
//           <th>Status</th>
//           <th onClick={() => requestSort("createdAt")} className="sortable">Created ↕</th>
//         </tr>
//       </thead>
//       <tbody>
//         {sortedUsers.map((u, index) => (
//           <tr key={u.id || index} className="dbRow">
//             <td>{u.id?.substring(0, 8)}...</td>
//             <td className="text-bold">{u.username}</td>
//             <td>{u.email}</td>
//             <td>
//               <span className={`roleBadge ${u.role === "ADMIN" ? "red" : "blue"}`}>
//                 {u.role}
//               </span>
//             </td>
//             <td>{u.status || "offline"}</td>
//             <td>{formatDateTime(u.createdAt)}</td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );

// // ================= HIỂN THỊ TRẠNG THÁI EDIT NGAY TRONG Ô CONTENT =================
// // ================= TÁCH CỘT NỘI DUNG GỐC VÀ NỘI DUNG CHỈNH SỬA PHÍA ADMIN (KHÔNG THÊM CỘT DB) =================
//   const renderMessages = () => (
//     <table className="dbTable">
//       <thead>
//         <tr>
//           <th onClick={() => requestSort("senderName")} className="sortable">Sender ↕</th>
          
//           {/* Cột 1: Nội dung gốc ban đầu */}
//           <th style={{ width: "25%" }} onClick={() => requestSort("content")} className="sortable">Content (Original) ↕</th>
          
//           {/* Cột 2: Nội dung mới sau khi sửa */}
//           <th style={{ width: "25%" }} onClick={() => requestSort("content")} className="sortable">Content (Edited) ↕</th>
          
//           <th>Conversation</th>
          
//           <th onClick={() => requestSort("createdAt")} className="sortable">Created At ↕</th>
          
//           {/* Cột 3: Thời gian thực hiện chỉnh sửa */}
//           <th onClick={() => requestSort("updatedAt")} className="sortable">Edited At ↕</th>
//         </tr>
//       </thead>
//       <tbody>
//         {sortedMessages.map((m, index) => {
//           // 1. Kiểm tra tin nhắn đã chỉnh sửa chưa bằng cấu trúc chuỗi "|||"
//           const hasFormatEdited = m.content && m.content.includes("|||");
          
//           // Hoặc kiểm tra thêm bằng thời gian: updatedAt lệch với createdAt trên 1 giây (1000ms)
//           const isMessageEdited = hasFormatEdited || 
//             (m.updatedAt && m.createdAt && (new Date(m.updatedAt).getTime() - new Date(m.createdAt).getTime() > 1000));
          
//           let originalText = m.content;
//           let editedText = <span className="text-muted">—</span>;

//           // 2. Nếu chuỗi có chứa token "|||" thì tiến hành bóc tách dữ liệu
//           if (hasFormatEdited) {
//             const parts = m.content.split("|||");
//             originalText = parts[0]; // Chữ ban đầu (Ví dụ: "ô")
//             editedText = parts[1];   // Chữ mới sau khi lưu (Ví dụ: "ô312")
//           }

//           return (
//             <tr key={m.id || index} className="dbRow">
//               <td className="text-bold">{m.senderName}</td>
              
//               {/* HIỂN THỊ CỘT NỘI DUNG GỐC */}
//               <td>
//                 {m.content ? (
//                   <span style={{ color: isMessageEdited ? "#949ba4" : "#ffffff", wordBreak: "break-all" }}>
//                     {originalText}
//                   </span>
//                 ) : (
//                   <i className="text-muted">[File]</i>
//                 )}
//               </td>

//               {/* HIỂN THỊ CỘT NỘI DUNG MỚI (EDITED) */}
//               <td>
//                 {m.content ? (
//                   isMessageEdited ? (
//                     <span style={{ color: "#faa61a", fontWeight: "500", wordBreak: "break-all" }}>
//                       {editedText}
//                     </span>
//                   ) : (
//                     <span className="text-muted">—</span>
//                   )
//                 ) : (
//                   <i className="text-muted">[File]</i>
//                 )}
//               </td>

//               <td className="text-muted">{m.conversationId?.substring(0, 8)}...</td>
              
//               {/* Thời gian tạo tin nhắn */}
//               <td>{formatDateTime(m.createdAt)}</td>
              
//               {/* CỘT THỜI GIAN CHỈNH SỬA */}
//               <td>
//                 {isMessageEdited ? (
//                   <span style={{ color: "#faa61a", fontSize: "12px", fontWeight: "500" }}>
//                     {formatDateTime(m.updatedAt)}
//                   </span>
//                 ) : (
//                   <span className="text-muted" style={{ fontSize: "12px" }}>Chưa sửa</span>
//                 )}
//               </td>
//             </tr>
//           );
//         })}
//       </tbody>
//     </table>
//   );

//   const renderFiles = () => (
//     <table className="dbTable">
//       <thead>
//         <tr>
//           <th onClick={() => requestSort("fileName")} className="sortable">File Name ↕</th>
//           <th>Type</th>
//           <th onClick={() => requestSort("size")} className="sortable">Size ↕</th>
//           <th onClick={() => requestSort("createdAt")} className="sortable">Created At ↕</th>
//           <th>Uploader</th>
//           <th>Action</th>
//         </tr>
//       </thead>
//       <tbody>
//         {sortedFiles.map((f, index) => (
//           <tr key={f.id || index} className="dbRow">
//             <td className="truncate-text">📄 {f.fileName || f.name || "Unknown"}</td>
//             <td>{f.contentType || f.fileType || "N/A"}</td>
//             <td>
//               {(f.size || f.fileSize) ? ((f.size || f.fileSize) / 1024).toFixed(1) + " KB" : "0 KB"}
//             </td>
//             <td>{formatDateTime(f.createdAt)}</td>
//             <td>{f.uploaderName || "System"}</td>
//             <td>
//               <a href={f.url || f.fileUrl} target="_blank" rel="noreferrer" className="runBtn link-btn">Open</a>
//             </td>
//           </tr>
//         ))}
//       </tbody>
//     </table>
//   );

//   const renderContent = () => {
//     switch (active) {
//       case "users": return renderUsers();
//       case "messages": return renderMessages();
//       case "files": return renderFiles();
//       default:
//         return (
//           <div className="dashboardGrid">
//             <StatBox title="Users" value={stats.totalUsers} color="#5865F2" />
//             <StatBox title="Conversations" value={stats.totalConversations} color="#3ba55c" />
//             <StatBox title="Messages" value={stats.totalMessages} color="#faa61a" />
//             <StatBox title="Files" value={stats.totalFiles} color="#f23f42" />
//           </div>
//         );
//     }
//   };

//   // return (
//   //   <div className="adminWrapper">
//   //     <div className="adminSidebar">
//   //       <div className="dbHeader"><strong>DB MANAGER</strong></div>
//   //       <div className="category">
//   //         <div className="categoryTitle">SYSTEM</div>
//   //         <div className={`navItem ${active === "dashboard" ? "active" : ""}`} onClick={() => setActive("dashboard")}>dashboard</div>
//   //       </div>
//   //       <div className="category">
//   //         <div className="categoryTitle">DATA</div>
//   //         <div className={`navItem ${active === "users" ? "active" : ""}`} onClick={() => setActive("users")}>users</div>
//   //         <div className={`navItem ${active === "messages" ? "active" : ""}`} onClick={() => setActive("messages")}>messages</div>
//   //         <div className={`navItem ${active === "files" ? "active" : ""}`} onClick={() => setActive("files")}>files</div>
//   //       </div>
//   //     </div>
      
//   //     <div className="mainContent">
//   //       <div className="contentHeader">
//   //         <h3 style={{ color: "white" }}>{active.toUpperCase()}</h3>
//   //         <button className="runBtn" onClick={() => { localStorage.clear(); window.location.href = "/login"; }}>Logout</button>
//   //       </div>
//   //       <div className="tableArea">{renderContent()}</div>
//   //     </div>
//   //   </div>
//   // );
// // ... (các phần khác giữ nguyên)

//   return (
//     <div className="adminWrapper">
//       {/* 1. Đưa nút Logout vào trong Sidebar */}
//       <div className="adminSidebar">
//         <div>
//           <div className="dbHeader"><strong>DB MANAGER</strong></div>
//           <div className="category">
//             <div className="categoryTitle">SYSTEM</div>
//             <div className={`navItem ${active === "dashboard" ? "active" : ""}`} onClick={() => setActive("dashboard")}>dashboard</div>
//           </div>
//           <div className="category">
//             <div className="categoryTitle">DATA</div>
//             <div className={`navItem ${active === "users" ? "active" : ""}`} onClick={() => setActive("users")}>users</div>
//             <div className={`navItem ${active === "messages" ? "active" : ""}`} onClick={() => setActive("messages")}>messages</div>
//             <div className={`navItem ${active === "files" ? "active" : ""}`} onClick={() => setActive("files")}>files</div>
//           </div>
//         </div>

//         {/* Nút Logout nằm ở đây (cuối sidebar) */}
//         <div style={{ marginTop: "auto", padding: "10px" }}>
//           <button 
//             className="runBtn" 
//             style={{ width: "100%", backgroundColor: "#f23f42" }} 
//             onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>
      
//       <div className="mainContent">
//         <div className="contentHeader">
//           <h3 style={{ color: "white" }}>{active.toUpperCase()}</h3>
//           {/* Đã xóa nút Logout ở đây */}
//         </div>
//         <div className="tableArea">{renderContent()}</div>
//       </div>
//     </div>
//   );
// }

// function StatBox({ title, value, color }) {
//   return (
//     <div className="statCard" style={{ borderLeft: `4px solid ${color}` }}>
//       <h4>{title}</h4>
//       <p>{value}</p>
//     </div>
//   );
// }



// import React, { useState } from "react";
// import { useAdminData } from "../../hooks/useAdminData";
// import AdminSidebar from "../../components/admin/AdminSidebar";
// import { TableUsers, TableMessages, TableFiles } from "../../components/admin/Table";
// import "../../styles/AdminDashboard.css";

// export default function AdminDashboard() {
//   const [active, setActive] = useState("dashboard");
//   // 1. Lấy thêm searchTerm, setSearchTerm, và getFilteredData từ hook
//   const { 
//     users, messages, files, stats, 
//     requestSort, sortData, 
//     searchTerm, setSearchTerm, getFilteredData 
//   } = useAdminData();

//   return (
//     <div className="adminWrapper">
//       <AdminSidebar active={active} setActive={setActive} />
      
//       <div className="mainContent">
//         <div className="contentHeader">
//           <h3 style={{ color: "white" }}>{active.toUpperCase()}</h3>
//         </div>
        
//         <div className="tableArea">
//           {active === "users" && (
//             <TableUsers 
//               data={getFilteredData(sortData(users), ["username", "email"])} 
//               requestSort={requestSort}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//             />
//           )}
          
//           {active === "messages" && (
//             <TableMessages 
//               data={getFilteredData(sortData(messages), ["senderName", "content"])} 
//               requestSort={requestSort}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//             />
//           )}
          
//           {active === "files" && (
//             <TableFiles 
//               data={getFilteredData(sortData(files), ["fileName"])} 
//               requestSort={requestSort}
//               searchTerm={searchTerm}
//               setSearchTerm={setSearchTerm}
//             />
//           )}
          
//           {active === "dashboard" && (
//             <div className="dashboardGrid">
//               <StatBox title="Users" value={stats.totalUsers} color="#5865F2" />
//               <StatBox title="Conversations" value={stats.totalConversations} color="#3ba55c" />
//               <StatBox title="Messages" value={stats.totalMessages} color="#faa61a" />
//               <StatBox title="Files" value={stats.totalFiles} color="#f23f42" />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatBox({ title, value, color }) {
//   return (
//     <div className="statCard" style={{ borderLeft: `4px solid ${color}` }}>
//       <h4>{title}</h4>
//       <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { useAdminData } from "../../hooks/useAdminData";
// import AdminSidebar from "../../components/admin/AdminSidebar";
// import { TableUsers, TableMessages, TableFiles, Pagination } from "../../components/admin/Table";
// import "../../styles/AdminDashboard.css";

// export default function AdminDashboard() {
//   const [active, setActive] = useState("dashboard");
  
//   // 1. Lấy tất cả các hàm và state từ hook
//   const { 
//     users, messages, files, stats, 
//     requestSort, sortData, 
//     searchTerm, setSearchTerm, getFilteredData,
//     currentPage, setCurrentPage, itemsPerPage 
//   } = useAdminData();

//   // 2. Reset trang về 1 khi người dùng tìm kiếm hoặc chuyển tab
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, active, setCurrentPage]);

//   // 3. Hàm phân trang (cắt dữ liệu)
//   const paginateData = (dataList) => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return dataList.slice(startIndex, startIndex + itemsPerPage);
//   };

//   // 4. Helper xử lý dữ liệu: Lọc + Sắp xếp + Phân trang
//   const getProcessedData = (rawList, searchKeys) => {
//     const filtered = getFilteredData(sortData(rawList), searchKeys);
//     return {
//       displayData: paginateData(filtered),
//       totalItems: filtered.length
//     };
//   };

//   return (
//     <div className="adminWrapper">
//       <AdminSidebar active={active} setActive={setActive} />
      
//       <div className="mainContent">
//         <div className="contentHeader">
//           <h3 style={{ color: "white" }}>{active.toUpperCase()}</h3>
//         </div>
        
//         <div className="tableArea">
//           {/* USERS TABLE */}
//           {active === "users" && (() => {
//             const { displayData, totalItems } = getProcessedData(users, ["username", "email"]);
//             return (
//               <>
//                 <TableUsers data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* MESSAGES TABLE */}
//           {active === "messages" && (() => {
//             const { displayData, totalItems } = getProcessedData(messages, ["senderName", "content"]);
//             return (
//               <>
//                 <TableMessages data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* FILES TABLE */}
//           {active === "files" && (() => {
//             const { displayData, totalItems } = getProcessedData(files, ["fileName"]);
//             return (
//               <>
//                 <TableFiles data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* DASHBOARD GRID */}
//           {active === "dashboard" && (
//             <div className="dashboardGrid">
//               <StatBox title="Users" value={stats.totalUsers} color="#5865F2" />
//               <StatBox title="Conversations" value={stats.totalConversations} color="#3ba55c" />
//               <StatBox title="Messages" value={stats.totalMessages} color="#faa61a" />
//               <StatBox title="Files" value={stats.totalFiles} color="#f23f42" />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatBox({ title, value, color }) {
//   return (
//     <div className="statCard" style={{ borderLeft: `4px solid ${color}` }}>
//       <h4>{title}</h4>
//       <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { useAdminData } from "../../hooks/useAdminData";
// import AdminSidebar from "../../components/admin/AdminSidebar";
// // Đã thêm TableGroups vào import
// import { TableUsers, TableMessages, TableFiles, TableGroups, Pagination } from "../../components/admin/Table";
// import "../../styles/AdminDashboard.css";

// export default function AdminDashboard() {
//   const [active, setActive] = useState("dashboard");
  
//   // 1. Lấy tất cả các hàm và state từ hook (đã bao gồm groups)
//   const { 
//     users, messages, files, groups, stats, 
//     requestSort, sortData, 
//     searchTerm, setSearchTerm, getFilteredData,
//     currentPage, setCurrentPage, itemsPerPage 
//   } = useAdminData();

//   // 2. Reset trang về 1 khi người dùng tìm kiếm hoặc chuyển tab
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, active, setCurrentPage]);

//   // 3. Hàm phân trang (cắt dữ liệu)
//   const paginateData = (dataList) => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return dataList.slice(startIndex, startIndex + itemsPerPage);
//   };

//   // 4. Helper xử lý dữ liệu: Lọc + Sắp xếp + Phân trang
//   const getProcessedData = (rawList, searchKeys) => {
//     const filtered = getFilteredData(sortData(rawList), searchKeys);
//     return {
//       displayData: paginateData(filtered),
//       totalItems: filtered.length
//     };
//   };

//   return (
//     <div className="adminWrapper">
//       <AdminSidebar active={active} setActive={setActive} />
      
//       <div className="mainContent">
//         <div className="contentHeader">
//           <h3 style={{ color: "white" }}>{active.toUpperCase()}</h3>
//         </div>
        
//         <div className="tableArea">
//           {/* USERS TABLE */}
//           {active === "users" && (() => {
//             const { displayData, totalItems } = getProcessedData(users, ["username", "email"]);
//             return (
//               <>
//                 <TableUsers data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* GROUPS TABLE - MỚI BỔ SUNG */}
//           {active === "groups" && (() => {
//             const { displayData, totalItems } = getProcessedData(groups, ["name"]);
//             return (
//               <>
//                 <TableGroups data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* MESSAGES TABLE */}
//           {active === "messages" && (() => {
//             const { displayData, totalItems } = getProcessedData(messages, ["senderName", "content"]);
//             return (
//               <>
//                 <TableMessages data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* FILES TABLE */}
//           {active === "files" && (() => {
//             const { displayData, totalItems } = getProcessedData(files, ["fileName"]);
//             return (
//               <>
//                 <TableFiles data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {/* DASHBOARD GRID */}
//           {active === "dashboard" && (
//             <div className="dashboardGrid">
//               <StatBox title="Users" value={stats.totalUsers} color="#5865F2" />
//               <StatBox title="Groups" value={groups.length} color="#3ba55c" />
//               <StatBox title="Messages" value={stats.totalMessages} color="#faa61a" />
//               <StatBox title="Files" value={stats.totalFiles} color="#f23f42" />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatBox({ title, value, color }) {
//   return (
//     <div className="statCard" style={{ borderLeft: `4px solid ${color}` }}>
//       <h4>{title}</h4>
//       <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
//     </div>
//   );
// }










// import React, { useState, useEffect } from "react";
// // import axios from "axios"; // Đảm bảo đã import axios
// import { useAdminData } from "../../hooks/useAdminData";
// import AdminSidebar from "../../components/admin/AdminSidebar";
// import { TableUsers, TableMessages, TableFiles, TableGroups, Pagination } from "../../components/admin/Table";
// import "../../styles/AdminDashboard.css";

// export default function AdminDashboard() {
//   const [active, setActive] = useState("dashboard");
//   // const token = localStorage.getItem("token"); // Khai báo token để dùng trong handleDelete
  
//   const { 
//     users, messages, files, groups, stats, 
//     requestSort, sortData, 
//     searchTerm, setSearchTerm, getFilteredData,
//     currentPage, setCurrentPage, itemsPerPage, deleteData
//   } = useAdminData();

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchTerm, active, setCurrentPage]);

//   const paginateData = (dataList) => {
//     const startIndex = (currentPage - 1) * itemsPerPage;
//     return dataList.slice(startIndex, startIndex + itemsPerPage);
//   };

//   const getProcessedData = (rawList, searchKeys) => {
//     const filtered = getFilteredData(sortData(rawList), searchKeys);
//     return {
//       displayData: paginateData(filtered),
//       totalItems: filtered.length
//     };
//   };

// const handleDelete = async (id) => {
//     // 1. Xác nhận xóa
//     if (!window.confirm(`Bạn có chắc chắn muốn xóa/giải tán mục có ID: ${id} không?`)) return;

//     // 2. Gọi hàm xóa từ hook. 
//     // Chúng ta truyền 'active' để hook biết đang xóa ở bảng nào (users, groups,...)
//     const success = await deleteData(active, id);

//     if (success) {
//         // Không cần window.location.reload()
//         // Giao diện sẽ tự cập nhật nhờ setData trong hook
//         alert("Thao tác thành công!");
//     } else {
//         alert("Xóa thất bại! Vui lòng kiểm tra terminal của Backend.");
//     }
// };
//   return (
//     <div className="adminWrapper">
//       <AdminSidebar active={active} setActive={setActive} />
      
//       <div className="mainContent">
//         <div className="contentHeader">
//           <h3 style={{ color: "white" }}>{active.toUpperCase()}</h3>
//         </div>
        
//         <div className="tableArea">
//           {active === "users" && (() => {
//             const { displayData, totalItems } = getProcessedData(users, ["username", "email"]);
//             return (
//               <>
//                 <TableUsers data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {active === "groups" && (() => {
//             const { displayData, totalItems } = getProcessedData(groups, ["name"]);
//             return (
//               <>
//                 <TableGroups data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {active === "messages" && (() => {
//             const { displayData, totalItems } = getProcessedData(messages, ["senderName", "content"]);
//             return (
//               <>
//                 <TableMessages data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {active === "files" && (() => {
//             const { displayData, totalItems } = getProcessedData(files, ["fileName"]);

//             console.log("Dữ liệu file truyền vào Table:", displayData);
//             return (
//               <>
//                 <TableFiles 
//                   data={displayData} 
//                   requestSort={requestSort} 
//                   searchTerm={searchTerm} 
//                   setSearchTerm={setSearchTerm}
//                   onDelete={handleDelete} // Đã được định nghĩa ở trên
//                 />
//                 <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
//               </>
//             );
//           })()}
          
//           {active === "dashboard" && (
//             <div className="dashboardGrid">
//               <StatBox title="Users" value={stats.totalUsers} color="#5865F2" />
//               <StatBox title="Groups" value={groups.length} color="#3ba55c" />
//               <StatBox title="Messages" value={stats.totalMessages} color="#faa61a" />
//               <StatBox title="Files" value={stats.totalFiles} color="#f23f42" />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// function StatBox({ title, value, color }) {
//   return (
//     <div className="statCard" style={{ borderLeft: `4px solid ${color}` }}>
//       <h4>{title}</h4>
//       <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
//     </div>
//   );
// }


// import axios from "axios"; // Đảm bảo dòng này đã có
import { message } from "antd";
import React, { useState, useEffect } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { 
  TableUsers, 
  TableMessages, 
  TableFiles, 
  TableGroups, 
  TableReports, 
  Pagination 
} from "../../components/admin/Table";
import "../../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const [active, setActive] = useState("dashboard");
  // Trong component AdminDashboard.js

  // const { 
  //   users, messages, files, groups, reports,setReports ,stats, 
  //   requestSort, sortData, 
  //   searchTerm, setSearchTerm, getFilteredData,
  //   currentPage, setCurrentPage, itemsPerPage, deleteData
  // } = useAdminData();


  const { 
  users, messages, files, groups, reports, updateReportStatus, stats, 
  requestSort, sortData, 
  searchTerm, setSearchTerm, getFilteredData,
  currentPage, setCurrentPage, itemsPerPage, deleteData
} = useAdminData();

  // Reset trang về 1 khi đổi tab hoặc tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, active, setCurrentPage]);

  const paginateData = (dataList) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dataList.slice(startIndex, startIndex + itemsPerPage);
  };

  const getProcessedData = (rawList, searchKeys) => {
    const filtered = getFilteredData(sortData(rawList), searchKeys);
    return {
      displayData: paginateData(filtered),
      totalItems: filtered.length
    };
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa mục có ID: ${id} không?`)) return;

    // Lưu ý: deleteData đã được cập nhật để xử lý URL riêng cho 'reports'
    const success = await deleteData(active, id);

    if (success) {
        alert("Thao tác thành công!");
    } else {
        alert("Xóa thất bại! Vui lòng kiểm tra console hoặc Backend.");
    }
  };


// Trong AdminDashboard.js

// const handleResolve = async (id) => {
//   try {
//     // Gọi hàm từ hook. Hook này đã bao gồm logic gọi API và setData bên trong
//     const success = await updateReportStatus(id, "resolved");
    
//     if (success) {
//       // Thành công: Thông báo cho người dùng
//       message.success("Báo cáo đã được giải quyết!");
//     } else {
//       // Thất bại: Thông báo lỗi
//       message.error("Có lỗi xảy ra khi cập nhật!");
//     }
//   } catch (error) {
//     message.error("Đã có lỗi hệ thống xảy ra!");
//   }
// };

const handleUpdateStatus = async (id, status) => {
  try {
    const success = await updateReportStatus(id, status); // Truyền status vào đây ('resolved' hoặc 'rejected')
    
    if (success) {
      message.success(`Đã cập nhật trạng thái thành: ${status}`);
    } else {
      message.error("Cập nhật thất bại!");
    }
  } catch (error) {
    message.error("Có lỗi xảy ra!");
  }
};

  return (
    <div className="adminWrapper">
      <AdminSidebar active={active} setActive={setActive} />
      
      <div className="mainContent">
        <div className="contentHeader">
          <h3 style={{ color: "white", textTransform: "capitalize" }}>{active}</h3>
        </div>
        
        <div className="tableArea">
          {/* Tab Users */}
          {active === "users" && (() => {
            const { displayData, totalItems } = getProcessedData(users, ["username", "email"]);
            return (
              <>
                <TableUsers data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
                <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
              </>
            );
          })()}
          
          {/* Tab Groups */}
          {active === "groups" && (() => {
            const { displayData, totalItems } = getProcessedData(groups, ["name"]);
            return (
              <>
                <TableGroups data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
                <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
              </>
            );
          })()}
          
          {/* Tab Messages */}
          {active === "messages" && (() => {
            const { displayData, totalItems } = getProcessedData(messages, ["senderName", "content"]);
            return (
              <>
                <TableMessages data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
                <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
              </>
            );
          })()}
          
          {/* Tab Files */}
          {active === "files" && (() => {
            const { displayData, totalItems } = getProcessedData(files, ["fileName"]);
            return (
              <>
                <TableFiles data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} />
                <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
              </>
            );
          })()}

          {/* Tab Reports */}
          {active === "reports" && (() => {
            const { displayData, totalItems } = getProcessedData(reports, ["reason", "reporterName", "targ  etName"]);
            return (
              <>
                <TableReports data={displayData} requestSort={requestSort} searchTerm={searchTerm} setSearchTerm={setSearchTerm} onDelete={handleDelete} onResolve={handleUpdateStatus} />
                <Pagination currentPage={currentPage} totalItems={totalItems} itemsPerPage={itemsPerPage} setCurrentPage={setCurrentPage} />
              </>
            );
          })()}
          
          {/* Dashboard */}
          {active === "dashboard" && (
            <div className="dashboardGrid">
              <StatBox title="Users" value={stats.totalUsers || 0} color="#5865F2" />
              <StatBox title="Groups" value={groups.length || 0} color="#3ba55c" />
              <StatBox title="Messages" value={stats.totalMessages || 0} color="#faa61a" />
              <StatBox title="Files" value={stats.totalFiles || 0} color="#f23f42" />
              <StatBox title="Reports" value={reports.length || 0} color="#eb459f" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ title, value, color }) {
  return (
    <div className="statCard" style={{ borderLeft: `4px solid ${color}` }}>
      <h4>{title}</h4>
      <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}