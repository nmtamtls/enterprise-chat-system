import React, { useState } from 'react';
import { 
  EyeOutlined, DeleteOutlined, CloseOutlined, 
  CheckCircleOutlined, CloseCircleOutlined,
  UserOutlined, TeamOutlined, MessageOutlined 
} from "@ant-design/icons";
import { Modal } from "antd";


const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const SearchBar = ({ searchTerm, setSearchTerm }) => (
  <input
    type="text"
    placeholder="🔍 Tìm kiếm..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="search-input"
    style={{
      marginBottom: "15px",
      padding: "10px",
      width: "100%",
      borderRadius: "5px",
      border: "1px solid #444",
      backgroundColor: "#2f3136",
      color: "white",
    }}
  />
);

export const TableUsers = ({
  data,
  requestSort,
  searchTerm,
  setSearchTerm,
  onDelete = () => console.warn("onDelete chưa được định nghĩa"),
  onBlock = () => console.warn("onBlock chưa được định nghĩa"),
  onUnblock = () => console.warn("onUnblock chưa được định nghĩa"),
}) => (
  <>
    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    <table className="dbTable">
      <thead>
        <tr>
          <th onClick={() => requestSort("id")} className="sortable">ID ↕</th>
          <th onClick={() => requestSort("username")} className="sortable">Username ↕</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th onClick={() => requestSort("createdAt")} className="sortable">Created ↕</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((u, index) => (
          <tr key={u.id || index} className="dbRow">
            <td>{u.id?.substring(0, 8)}...</td>
            <td className="text-bold">{u.username}</td>
            <td>{u.email}</td>
            <td>
              <span className={`roleBadge ${u.role === "ADMIN" ? "red" : "blue"}`}>
                {u.role}
              </span>
            </td>
            <td>{u.status || "offline"}</td>
            <td>{formatDateTime(u.createdAt)}</td>
            <td>
              <div style={{ display: "flex", gap: "5px" }}>
                {/* Chỉ hiển thị các nút hành động nếu role không phải là ADMIN */}
                {u.role !== "ADMIN" ? (
                  <>
                    <button 
                      onClick={() => onBlock(u.id)} 
                      className="runBtn" 
                      style={{ backgroundColor: "#f39c12", color: "white", border: "none", padding: "3px 6px", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Block
                    </button>
                    <button 
                      onClick={() => onUnblock(u.id)} 
                      className="runBtn" 
                      style={{ backgroundColor: "#27ae60", color: "white", border: "none", padding: "3px 6px", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Unblock
                    </button>
                    <button 
                      onClick={() => onDelete(u.id)} 
                      className="runBtn danger" 
                      style={{ backgroundColor: "#ed4245", color: "white", border: "none", padding: "3px 6px", borderRadius: "3px", cursor: "pointer" }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <span style={{ color: "#777", fontSize: "0.85em", fontStyle: "italic" }}>
                    Protected
                  </span>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);
export const TableMessages = ({
  data,
  requestSort,
  searchTerm,
  setSearchTerm,
  onDelete,
}) => (
  <>
    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    <table className="dbTable">
      <thead>
        <tr>
          <th onClick={() => requestSort("senderName")} className="sortable">
            Sender ↕
          </th>
          <th
            style={{ width: "25%" }}
            onClick={() => requestSort("content")}
            className="sortable"
          >
            Content (Original) ↕
          </th>
          <th
            style={{ width: "25%" }}
            onClick={() => requestSort("content")}
            className="sortable"
          >
            Content (Edited) ↕
          </th>
          <th>Conversation</th>
          <th onClick={() => requestSort("createdAt")} className="sortable">
            Created At ↕
          </th>
          <th onClick={() => requestSort("updatedAt")} className="sortable">
            Edited At ↕
          </th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((m, index) => {
          const hasFormatEdited = m.content && m.content.includes("|||");
          const isMessageEdited =
            hasFormatEdited ||
            (m.updatedAt &&
              m.createdAt &&
              new Date(m.updatedAt).getTime() -
                new Date(m.createdAt).getTime() >
                1000);
          let originalText = m.content;
          let editedText = <span className="text-muted">—</span>;
          if (hasFormatEdited) {
            const parts = m.content.split("|||");
            originalText = parts[0];
            editedText = parts[1];
          }
          return (
            <tr key={m.id || index} className="dbRow">
              <td className="text-bold">{m.senderName}</td>
              <td>
                {m.content ? (
                  <span
                    style={{
                      color: isMessageEdited ? "#949ba4" : "#ffffff",
                      wordBreak: "break-all",
                    }}
                  >
                    {originalText}
                  </span>
                ) : (
                  <i className="text-muted">[File]</i>
                )}
              </td>
              <td>
                {m.content ? (
                  isMessageEdited ? (
                    <span
                      style={{
                        color: "#faa61a",
                        fontWeight: "500",
                        wordBreak: "break-all",
                      }}
                    >
                      {editedText}
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )
                ) : (
                  <i className="text-muted">[File]</i>
                )}
              </td>
              <td className="text-muted">
                {m.conversationId?.substring(0, 8)}...
              </td>
              <td>{formatDateTime(m.createdAt)}</td>
              <td>
                {isMessageEdited ? (
                  <span
                    style={{
                      color: "#faa61a",
                      fontSize: "12px",
                      fontWeight: "500",
                    }}
                  >
                    {formatDateTime(m.updatedAt)}
                  </span>
                ) : (
                  <span className="text-muted" style={{ fontSize: "12px" }}>
                    Chưa sửa
                  </span>
                )}
              </td>
              <td>
                <button 
                  onClick={() => onDelete(m.id)}
                  className="runBtn danger"
                  style={{ backgroundColor: "#ed4245", color: "white", border: "none", padding: "3px 6px", borderRadius: "3px", cursor: "pointer" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </>
);

export const TableFiles = ({
  data,
  requestSort,
  searchTerm,
  setSearchTerm,
  onDelete,
}) => (
  <>
    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    <table className="dbTable">
      <thead>
        <tr>
          <th onClick={() => requestSort("fileName")} className="sortable">
            File Name ↕
          </th>
          <th>Type</th>
          <th onClick={() => requestSort("size")} className="sortable">
            Size ↕
          </th>
          <th onClick={() => requestSort("createdAt")} className="sortable">
            Created At ↕
          </th>
          <th>Uploader</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((f, index) => (
          <tr key={f.id || index} className="dbRow">
            <td className="truncate-text">
              📄 {f.fileName || f.name || "Unknown"}
            </td>
            <td>{f.contentType || f.fileType || "N/A"}</td>
            <td>
              {f.size || f.fileSize
                ? ((f.size || f.fileSize) / 1024).toFixed(1) + " KB"
                : "0 KB"}
            </td>
            <td>{formatDateTime(f.createdAt)}</td>
            <td>{f.uploaderName || "System"}</td>

            <td style={{ display: "flex", gap: "8px" }}>
              {/* Nút OPEN */}
              <a
                href={f.url || f.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="runBtn link-btn"
                onClick={(e) => {
                  e.preventDefault();
                  const fileUrl = f.url || f.fileUrl;
                  const fileType = (
                    f.contentType ||
                    f.fileType ||
                    ""
                  ).toLowerCase();
                  const fileName = (f.fileName || f.name || "").toLowerCase();

                  if (
                    fileType.includes("pdf") ||
                    fileType.startsWith("text/") ||
                    fileName.endsWith(".txt") ||
                    fileType.startsWith("image/") ||
                    fileType.startsWith("video/") ||
                    fileType.startsWith("audio/")
                  ) {
                    window.open(fileUrl, "_blank");
                  } else if (
                    fileName.endsWith(".doc") ||
                    fileName.endsWith(".docx") ||
                    fileType.includes("word") ||
                    fileType.includes("officedocument")
                  ) {
                    window.open(
                      `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(fileUrl)}`,
                      "_blank",
                    );
                  } else {
                    alert("File này không hỗ trợ xem trực tiếp");
                  }
                }}
              >
                Open
              </a>
              {/* Nút DOWNLOAD */}
              <a
                href={f.url || f.fileUrl}
                download={f.fileName}
                className="runBtn link-btn"
              >
                Download
              </a>
              {/* Nút DELETE */}
              
<button
  onClick={() => {
    // Debug: In ra toàn bộ các trường của file để xem API trả về cái gì
    console.log("Cấu trúc file:", f);
    
    // Thử lấy ID bằng mọi cách có thể
    const fileId = f.id || f.fileId || f.uuid || f._id || f[0]; 
    
    if (!fileId) {
       alert("Lỗi: Không tìm thấy ID. API có vẻ không gửi trường 'id' lên!");
       return;
    }

    if (typeof onDelete === "function") {
      onDelete(fileId);
    }
  }}
  className="runBtn danger"
  style={{ backgroundColor: "#ed4245", color: "white", border: "none", cursor: "pointer", padding: "5px 10px", borderRadius: "3px" }}
>
  Delete
</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
);
export const Pagination = ({
  currentPage,
  totalItems,
  itemsPerPage,
  setCurrentPage,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null;

  // Xử lý khi người dùng nhập số trang trực tiếp
  const handlePageChange = (e) => {
    let page = parseInt(e.target.value);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div
      className="pagination"
      style={{
        marginTop: "15px",
        display: "flex",
        gap: "8px",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* Nút về trang đầu */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(1)}
        style={{
          padding: "5px 10px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        &laquo;&laquo;
      </button>

      {/* Nút về trang trước */}
      <button
        disabled={currentPage === 1}
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        style={{
          padding: "5px 10px",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        &laquo;
      </button>

      {/* Ô nhập số trang */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          color: "white",
        }}
      >
        <input
          type="number"
          value={currentPage}
          onChange={handlePageChange}
          onFocus={(e) => e.target.select()}
          style={{
            width: "50px",
            textAlign: "center",
            padding: "3px",
            backgroundColor: "#2f3136",
            color: "white",
            border: "1px solid #444",
            borderRadius: "4px",
          }}
        />
        <span>/ {totalPages}</span>
      </div>

      {/* Nút đến trang sau */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        style={{
          padding: "5px 10px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        &raquo;
      </button>

      {/* Nút đến trang cuối */}
      <button
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(totalPages)}
        style={{
          padding: "5px 10px",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        &raquo;&raquo;
      </button>
    </div>
  );
};
export const TableGroups = ({
  data,
  requestSort,
  searchTerm,
  setSearchTerm,
  onDelete,
}) => (
  <>
    <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
    <table className="dbTable">
      <thead>
        <tr>
          <th onClick={() => requestSort("name")} className="sortable">
            Tên Nhóm ↕
          </th>
          <th>Người tạo (Nhóm trưởng)</th>
          <th>Số lượng</th>
          <th>Thành viên</th>
          <th onClick={() => requestSort("createdAt")} className="sortable">
            Ngày tạo ↕
          </th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => {
          const group = item.conversation || {};
          // Sử dụng trực tiếp creatorName từ Backend truyền sang
          const creatorDisplay = item.creatorName || "Hệ thống";

          return (
            <tr key={group.id || index} className="dbRow">
              <td className="text-bold">{group.name || "Không tên"}</td>
              <td style={{ color: "#faa61a", fontWeight: "bold" }}>
                {creatorDisplay}
              </td>
              <td>
                <span className="badge-count">{item.memberCount}</span>
              </td>
              <td
                style={{
                  fontSize: "12px",
                  color: "#b9bbbe",
                  maxWidth: "200px",
                }}
              >
                {item.memberNames?.join(", ")}
              </td>
              <td>{formatDateTime(group.createdAt)}</td>
<td>
                <button 
                  className="runBtn danger"
                  onClick={() => onDelete(group.id)}
                  style={{ backgroundColor: "#ed4245", color: "white", border: "none", padding: "5px 10px", borderRadius: "3px", cursor: "pointer" }}
                >
                  Giải tán
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </>
);


// export const TableReports = ({
//   data,
//   requestSort,
//   searchTerm,
//   setSearchTerm,
//   onDelete,
//   onResolve
// }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);

//   const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

//   return (
//     <>
//       <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
//       <table className="dbTable">
//         <thead>
//           <tr>
//             <th onClick={() => requestSort("reporterName")} className="sortable">Người báo cáo ↕</th>
//             {/* <th onClick={() => requestSort("targetName")} className="sortable">Đối tượng bị báo cáo ↕</th> */}
            
//             <th onClick={() => requestSort("status")} className="sortable">Trạng thái ↕</th>
//             <th>Xem chi tiết</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((r, index) => (
//             <tr key={r.id || index} className="dbRow">
//               <td className="text-bold">{r.reporterName || "Ẩn danh"}</td>
//               <td>
//                 <span className="text-primary" style={{ fontWeight: 'bold' }}>{r.targetName || "User không xác định"}</span>
//               </td>
//               <td>
//                 <span className={`badge-status ${r.status?.toLowerCase()}`}>
//                   {r.status || "PENDING"}
//                 </span>
//               </td>
//               <td style={{ textAlign: "center" }}>
//                 <EyeOutlined 
//                   style={{ color: "#5865f2", fontSize: "20px", cursor: "pointer" }} 
//                   onClick={() => { setSelectedReport(r); setIsModalOpen(true); }} 
//                 />
//               </td>

// <td style={{ textAlign: "center" }}>
//   <DeleteOutlined 
//     style={{ 
//       color: "#ed4245", 
//       fontSize: "18px", 
//       cursor: "pointer",
//       padding: "5px"
//     }} 
//     onClick={(e) => {
//       e.stopPropagation(); // Ngăn chặn sự kiện click lan ra hàng
//       onDelete(r.id);      // Gọi hàm xóa trực tiếp
//     }} 
//   />
// </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Modal chi tiết báo cáo */}
//       <Modal
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         footer={null}
//         centered
//         closable={false}
//         width={450}
//         destroyOnHidden
//         zIndex={10000}
//         bodyStyle={{ padding: 0, background: "transparent" }}
//         style={{ background: "transparent" }}
//       >
//         {selectedReport && (
//           <div style={{ background: "#111214", borderRadius: "12px", overflow: "hidden", position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
//             <CloseOutlined 
//               onClick={() => setIsModalOpen(false)} 
//               style={{ position: "absolute", top: 15, right: 15, color: "#fff", cursor: "pointer", fontSize: "16px", zIndex: 10 }} 
//             />
//             <div style={{ height: "70px", background: "#5865f2" }} />
//             <div style={{ padding: 20 }}>
//               <h3 style={{ color: "#fff", marginBottom: 20 }}>Chi tiết báo cáo</h3>
//               <InfoField label="Người báo cáo" value={selectedReport.reporterName || "Ẩn danh"} />
//               <InfoField label="Loại báo cáo" value={selectedReport.reportType} />
//               <InfoField label="Đối tượng" value={selectedReport.targetName || "N/A"} />
//               <InfoField label="Ngày tạo" value={formatDateTime(selectedReport.createdAt)} />
//               <InfoField label="Lý do" value={selectedReport.reason} />
//               <InfoField label="Mô tả chi tiết" value={selectedReport.description || "Không có mô tả bổ sung."} />
              
// <div style={{ display: "flex", gap: "10px", marginTop: 20 }}>
//   {/* Nút Từ chối: Luôn hiển thị để người dùng có thể đổi ý */}
//   <button 
//     type="button" 
//     onClick={(e) => { 
//       e.stopPropagation(); 
//       onResolve(selectedReport.id, "rejected"); 
//       setIsModalOpen(false); 
//     }} 
//     style={{ 
//       flex: 1, 
//       padding: "10px", 
//       background: selectedReport.status?.toLowerCase() === 'rejected' ? "#555" : "#da373c", // Làm mờ nếu đang là từ chối
//       border: "none", 
//       borderRadius: "5px", 
//       color: "#fff", 
//       cursor: "pointer", 
//       fontWeight: 600 
//     }}
//   >
//     <CloseCircleOutlined /> Từ chối
//   </button>
  
//   {/* Nút Giải quyết: Luôn hiển thị để người dùng có thể đổi ý */}
//   <button 
//     type="button" 
//     onClick={(e) => { 
//       e.stopPropagation(); 
//       onResolve(selectedReport.id, "resolved"); 
//       setIsModalOpen(false); 
//     }} 
//     style={{ 
//       flex: 1, 
//       padding: "10px", 
//       background: selectedReport.status?.toLowerCase() === 'resolved' ? "#555" : "#23a559", // Làm mờ nếu đang là giải quyết
//       border: "none", 
//       borderRadius: "5px", 
//       color: "#fff", 
//       cursor: "pointer", 
//       fontWeight: 600 
//     }}
//   >
//     <CheckCircleOutlined /> Giải quyết
//   </button>
// </div>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </>
//   );
// };

// const InfoField = ({ label, value }) => (
//   <div style={{ marginBottom: 15 }}>
//     <label style={{ display: "block", marginBottom: 8, color: "#b5bac1", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" }}>
//       {label}
//     </label>
//     <div style={{ background: "#2b2d31", padding: 10, borderRadius: 6, color: "#dbdee1", fontSize: "14px" }}>
//       {value}
//     </div>
//   </div>
// );


// export const TableReports = ({
//   data,
//   requestSort,
//   searchTerm,
//   setSearchTerm,
//   onDelete,
//   onResolve
// }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedReport, setSelectedReport] = useState(null);

//   const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

//   // Helper để lấy Icon theo loại báo cáo
//   const getReportIcon = (type) => {
//     switch (type) {
//       case "CONVERSATION": return <TeamOutlined style={{ color: "#3ba55d" }} />;
//       case "MESSAGE": return <MessageOutlined style={{ color: "#f1c40f" }} />;
//       default: return <UserOutlined style={{ color: "#5865f2" }} />;
//     }
//   };

//   return (
//     <>
//       <table className="dbTable">
//         <thead>
//           <tr>
//             <th onClick={() => requestSort("reporterName")} className="sortable">Người báo cáo ↕</th>
//             <th onClick={() => requestSort("reportType")} className="sortable">Loại ↕</th>
//             <th onClick={() => requestSort("targetName")} className="sortable">Đối tượng ↕</th>
//             <th onClick={() => requestSort("status")} className="sortable">Trạng thái ↕</th>
//             <th style={{ textAlign: "center" }}>Chi tiết</th>
//             <th style={{ textAlign: "center" }}>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {data.map((r, index) => (
//             <tr key={r.id || index} className="dbRow">
//               <td className="text-bold">{r.reporterName || "Ẩn danh"}</td>
              
//               {/* Cột Loại */}
//               <td>
//                 <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#b5bac1" }}>
//                   {getReportIcon(r.reportType)}
//                   <span style={{ fontSize: "12px", textTransform: "uppercase" }}>{r.reportType}</span>
//                 </div>
//               </td>

//               {/* Cột Đối tượng */}
//               <td>
//                 <span className="text-primary" style={{ fontWeight: 'bold' }}>
//                   {r.targetName || "N/A"}
//                 </span>
//               </td>

//               <td>
//                 <span className={`badge-status ${r.status?.toLowerCase()}`}>
//                   {r.status || "PENDING"}
//                 </span>
//               </td>

//               <td style={{ textAlign: "center" }}>
//                 <EyeOutlined 
//                   style={{ color: "#5865f2", fontSize: "20px", cursor: "pointer" }} 
//                   onClick={() => { setSelectedReport(r); setIsModalOpen(true); }} 
//                 />
//               </td>

//               <td style={{ textAlign: "center" }}>
//                 <DeleteOutlined 
//                   style={{ color: "#ed4245", fontSize: "18px", cursor: "pointer", padding: "5px" }} 
//                   onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} 
//                 />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Modal chi tiết */}
//       <Modal
//         open={isModalOpen}
//         onCancel={() => setIsModalOpen(false)}
//         footer={null}
//         centered
//         closable={false}
//         width={450}
//         destroyOnClose
//         zIndex={10000}
//         bodyStyle={{ padding: 0, background: "transparent" }}
//         style={{ background: "transparent" }}
//       >
//         {selectedReport && (
//           <div style={{ background: "#111214", borderRadius: "12px", overflow: "hidden", position: "relative", boxShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>
//             <CloseOutlined 
//               onClick={() => setIsModalOpen(false)} 
//               style={{ position: "absolute", top: 15, right: 15, color: "#fff", cursor: "pointer", fontSize: "16px", zIndex: 10 }} 
//             />
//             <div style={{ height: "70px", background: "#5865f2" }} />
//             <div style={{ padding: 20 }}>
//               <h3 style={{ color: "#fff", marginBottom: 20 }}>Chi tiết báo cáo</h3>
//               <InfoField label="Người báo cáo" value={selectedReport.reporterName || "Ẩn danh"} />
//               <InfoField 
//                 label="Loại báo cáo" 
//                 value={
//                   <span style={{ color: selectedReport.reportType === 'GROUP' ? '#3ba55d' : '#5865f2' }}>
//                     {selectedReport.reportType}
//                   </span>
//                 } 
//               />
//               <InfoField label="Đối tượng" value={selectedReport.targetName || "N/A"} />
//               <InfoField label="Ngày tạo" value={formatDateTime(selectedReport.createdAt)} />
//               <InfoField label="Lý do" value={selectedReport.reason} />
//               <InfoField label="Mô tả" value={selectedReport.description || "Không có mô tả."} />
              
//               <div style={{ display: "flex", gap: "10px", marginTop: 20 }}>
//                 <button 
//                   onClick={() => { onResolve(selectedReport.id, "rejected"); setIsModalOpen(false); }} 
//                   style={{ flex: 1, padding: "10px", background: selectedReport.status === 'REJECTED' ? "#555" : "#da373c", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", fontWeight: 600 }}
//                 >
//                   <CloseCircleOutlined /> Từ chối
//                 </button>
//                 <button 
//                   onClick={() => { onResolve(selectedReport.id, "resolved"); setIsModalOpen(false); }} 
//                   style={{ flex: 1, padding: "10px", background: selectedReport.status === 'RESOLVED' ? "#555" : "#23a559", border: "none", borderRadius: "5px", color: "#fff", cursor: "pointer", fontWeight: 600 }}
//                 >
//                   <CheckCircleOutlined /> Giải quyết
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </>
//   );
// };

// const InfoField = ({ label, value }) => (
//   <div style={{ marginBottom: 15 }}>
//     <label style={{ display: "block", marginBottom: 8, color: "#b5bac1", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" }}>
//       {label}
//     </label>
//     <div style={{ background: "#2b2d31", padding: 10, borderRadius: 6, color: "#dbdee1", fontSize: "14px" }}>
//       {value}
//     </div>
//   </div>
// );


// Định nghĩa InfoField ngay trong file này để tránh lỗi 'not defined'
const InfoField = ({ label, value }) => (
  <div style={{ marginBottom: 15 }}>
    <label
      style={{
        display: "block",
        marginBottom: 8,
        color: "#b5bac1",
        fontSize: 11,
        fontWeight: "bold",
        textTransform: "uppercase",
      }}
    >
      {label}
    </label>
    <div
      style={{
        background: "#2b2d31",
        padding: 10,
        borderRadius: 6,
        color: "#dbdee1",
        fontSize: "14px",
      }}
    >
      {value}
    </div>
  </div>
);

export const TableReports = ({
  data,
  requestSort,
  searchTerm,
  setSearchTerm,
  onDelete,
  onResolve,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const formatDateTime = (dateStr) => new Date(dateStr).toLocaleString();

  const getReportIcon = (type) => {
    switch (type) {
      case "GROUP":
        return <TeamOutlined style={{ color: "#3ba55d" }} />;
      case "MESSAGE":
        return <MessageOutlined style={{ color: "#f1c40f" }} />;
      case "USER":
        return <UserOutlined style={{ color: "#5865f2" }} />;
      default:
        return <UserOutlined style={{ color: "#5865f2" }} />;
    }
  };

  return (
    <>
      <table className="dbTable">
        <thead>
          <tr>
            <th onClick={() => requestSort("reporterName")} className="sortable">
              Người báo cáo ↕
            </th>
            <th onClick={() => requestSort("reportType")} className="sortable">
              Loại ↕
            </th>
            <th onClick={() => requestSort("targetName")} className="sortable">
              Đối tượng ↕
            </th>
            <th onClick={() => requestSort("status")} className="sortable">
              Trạng thái ↕
            </th>
            <th style={{ textAlign: "center" }}>Chi tiết</th>
            <th style={{ textAlign: "center" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {data.map((r, index) => (
            <tr key={r.id || index} className="dbRow">
              <td className="text-bold">{r.reporterName || "Ẩn danh"}</td>

              <td>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    color: "#b5bac1",
                  }}
                >
                  {getReportIcon(r.reportType)}
                  <span style={{ fontSize: "12px", textTransform: "uppercase" }}>
                    {r.reportType}
                  </span>
                </div>
              </td>

              <td>
                <span className="text-primary" style={{ fontWeight: "bold" }}>
                  {r.targetName || "N/A"}
                </span>
              </td>

              <td>
                <span className={`badge-status ${r.status?.toLowerCase()}`}>
                  {r.status || "PENDING"}
                </span>
              </td>

              <td style={{ textAlign: "center" }}>
                <EyeOutlined
                  style={{
                    color: "#5865f2",
                    fontSize: "20px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setSelectedReport(r);
                    setIsModalOpen(true);
                  }}
                />
              </td>

              <td style={{ textAlign: "center" }}>
                <DeleteOutlined
                  style={{
                    color: "#ed4245",
                    fontSize: "18px",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(r.id);
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Custom Modal - KHÔNG CÒN VIỀN TRẮNG */}
      {isModalOpen && selectedReport && (
        <div
          onClick={() => setIsModalOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10000,
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "450px",
              background: "#111214",
              borderRadius: "12px",
              overflow: "hidden",
              position: "relative",
              boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
            }}
          >
            <CloseOutlined
              onClick={() => setIsModalOpen(false)}
              style={{
                position: "absolute",
                top: 15,
                right: 15,
                color: "#fff",
                cursor: "pointer",
                fontSize: "16px",
                zIndex: 10,
              }}
            />

            <div style={{ height: "70px", background: "#5865f2" }} />

            <div style={{ padding: 20 }}>
              <h3 style={{ color: "#fff", marginBottom: 20 }}>
                Chi tiết báo cáo
              </h3>

              <InfoField
                label="Người báo cáo"
                value={selectedReport.reporterName || "Ẩn danh"}
              />

              <InfoField
                label="Loại báo cáo"
                value={selectedReport.reportType}
              />

              <InfoField
                label="Đối tượng"
                value={selectedReport.targetName || "N/A"}
              />

              <InfoField
                label="Ngày tạo"
                value={formatDateTime(selectedReport.createdAt)}
              />

              <InfoField label="Lý do" value={selectedReport.reason} />

              <InfoField
                label="Mô tả"
                value={selectedReport.description || "Không có mô tả."}
              />

              <div style={{ display: "flex", gap: "10px", marginTop: 20 }}>
                <button
                  onClick={() => {
                    onResolve(selectedReport.id, "rejected");
                    setIsModalOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#da373c",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <CloseCircleOutlined /> Từ chối
                </button>

                <button
                  onClick={() => {
                    onResolve(selectedReport.id, "resolved");
                    setIsModalOpen(false);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px",
                    background: "#23a559",
                    border: "none",
                    borderRadius: "5px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  <CheckCircleOutlined /> Giải quyết
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// const InfoField = ({ label, value }) => (
//   <div style={{ marginBottom: 15 }}>
//     <label style={{ display: "block", marginBottom: 8, color: "#b5bac1", fontSize: 11, fontWeight: "bold", textTransform: "uppercase" }}>
//       {label}
//     </label>
//     <div style={{ background: "#2b2d31", padding: 10, borderRadius: 6, color: "#dbdee1", fontSize: "14px" }}>
//       {value}
//     </div>
//   </div>
// );