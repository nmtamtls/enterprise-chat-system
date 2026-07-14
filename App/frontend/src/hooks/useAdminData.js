

import { useState, useEffect, useCallback } from "react";
import axios from "axios";

export const useAdminData = () => {
  const [data, setData] = useState({ 
    users: [], 
    messages: [], 
    files: [], 
    groups: [], 
    reports: [], 
    stats: {} 
  });
  
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

//   const fetchData = useCallback(async () => {
//   const token = localStorage.getItem("token");
//   if (!token) return (window.location.href = "/login");
  
//   const headers = { Authorization: `Bearer ${token}` };

//   // Sử dụng .catch() cho TỪNG API để nếu một cái lỗi thì trả về mảng rỗng []
//   const [statsRes, userRes, msgRes, fileRes, groupRes, reportRes] = await Promise.all([
//     axios.get("http://localhost:8082/api/admin/dashboard", { headers }).catch(() => ({ data: { data: {} } })),
//     axios.get("http://localhost:8082/api/users/all", { headers }).catch(() => ({ data: { data: [] } })),
//     axios.get("http://localhost:8082/api/messages", { headers }).catch((err) => {
//       console.error("Lỗi tại API Messages:", err); // In ra lỗi riêng cho API này
//       return { data: { data: [] } }; // Trả về mảng rỗng để không làm crash toàn bộ
//     }),
//     axios.get("http://localhost:8082/api/files/all", { headers }).catch(() => ({ data: { data: [] } })),
//     axios.get("http://localhost:8082/api/conversations/admin/groups", { headers }).catch(() => ({ data: { data: [] } })),
//     axios.get("http://localhost:8082/api/admin/reports", { headers }).catch(() => ({ data: { data: [] } }))
//   ]);

//   setData({ 
//     stats: statsRes.data.data || {}, 
//     users: userRes.data.data || [], 
//     messages: msgRes.data.data || [], 
//     files: fileRes.data.data || [],
//     groups: groupRes.data.data || [],
//     reports: reportRes.data.data || []
//   });
// }, []);

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");
    
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, userRes, msgRes, fileRes, groupRes, reportRes] = await Promise.all([
        axios.get("http://localhost:8082/api/admin/dashboard", { headers }),
        axios.get("http://localhost:8082/api/users/all", { headers }),
        axios.get("http://localhost:8082/api/messages", { headers }),
        axios.get("http://localhost:8082/api/files/all", { headers }),
        axios.get("http://localhost:8082/api/conversations/admin/groups", { headers }).catch(() => ({ data: { data: [] } })),
        axios.get("http://localhost:8082/api/admin/reports", { headers }).catch(() => ({ data: { data: [] } }))
      ]);

  //     //       const [statsRes, userRes, msgRes, fileRes, groupRes, reportRes] = await Promise.all([
  //     //   axios.get("https://tqgwvv8g-8082.asse.devtunnels.ms/api/admin/dashboard", { headers }),
  //     //   axios.get("https://tqgwvv8g-8082.asse.devtunnels.ms/api/users/all", { headers }),
  //     //   axios.get("https://tqgwvv8g-8082.asse.devtunnels.ms/api/messages", { headers }),
  //     //   axios.get("https://tqgwvv8g-8082.asse.devtunnels.ms/api/files/all", { headers }),
  //     //   axios.get("https://tqgwvv8g-8082.asse.devtunnels.ms/api/conversations/admin/groups", { headers }).catch(() => ({ data: { data: [] } })),
  //     //   axios.get("https://tqgwvv8g-8082.asse.devtunnels.ms/api/admin/reports", { headers }).catch(() => ({ data: { data: [] } }))
  //     // ]);


      setData({ 
        stats: statsRes.data.data || {}, 
        users: userRes.data.data || [], 
        messages: msgRes.data.data || [], 
        files: fileRes.data.data || [],
        groups: groupRes.data.data || [],
        reports: reportRes.data.data || []
      });
    } catch (err) { 
      console.error("Lỗi khi tải dữ liệu Admin:", err); 
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  const requestSort = (key) => {
    setSortConfig(prev => ({ 
      key, 
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc" 
    }));
  };

  const sortData = (dataList) => {
    return [...dataList].sort((a, b) => {
      const getVal = (obj) => {
        if (obj.conversation && obj.conversation[sortConfig.key] !== undefined) return obj.conversation[sortConfig.key];
        return obj[sortConfig.key] || 0;
      };

      let aVal = getVal(a);
      let bVal = getVal(b);
      
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const getFilteredData = (dataList, searchKeys) => {
    if (!searchTerm) return dataList;
    const lowerSearch = searchTerm.toLowerCase();
    return dataList.filter(item => 
      searchKeys.some(key => {
        const value = item.conversation ? item.conversation[key] : item[key];
        return String(value || "").toLowerCase().includes(lowerSearch);
      })
    );
  };

  const deleteData = async (tableType, id) => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    
    // Logic xác định URL xóa dựa trên tableType
    let baseUrl;
    if (tableType === 'reports') {
      baseUrl = `http://localhost:8082/api/reports/${id}`;

      // baseUrl = `https://tqgwvv8g-8082.asse.devtunnels.ms/api/reports/${id}`;
    } else {
      const targetTable = tableType === 'groups' ? 'conversations' : tableType;
      baseUrl = `http://localhost:8082/api/admin/${targetTable}/${id}`;
      //  baseUrl = `https://tqgwvv8g-8082.asse.devtunnels.ms/api/admin/${targetTable}/${id}`;
    }
    
    try {
      await axios.delete(baseUrl, { headers });
      
      setData(prev => ({
        ...prev,
        [tableType]: (prev[tableType] || []).filter(item => {
          const itemId = item.id || item.conversation?.id || item.fileId || item.uuid || item._id;
          return itemId !== id;
        })
      }));
      
      return true;
    } catch (err) {
      console.error(`Lỗi xóa dữ liệu tại ${tableType}:`, err);
      return false;
    }
  };

const updateReportStatus = async (reportId, status) => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // Truyền status vào URL, không phải trong body
    await axios.put(
      `http://localhost:8082/api/reports/${reportId}/status?status=${status}`,
      //  `https://tqgwvv8g-8082.asse.devtunnels.ms/api/reports/${reportId}/status?status=${status}`, 
      {}, // Body để trống
      { headers }
    );

    // Cập nhật State...
    setData(prev => ({
      ...prev,
      reports: prev.reports.map(report => 
        report.id === reportId ? { ...report, status: status } : report
      )
    }));
    return true;
  } catch (err) {
    console.error("Lỗi:", err);
    return false;
  }
};

return { 
    ...data, 
    requestSort, 
    sortData, 
    deleteData,
    searchTerm, 
    updateReportStatus,
    setSearchTerm, 
    getFilteredData,
    currentPage, 
    setCurrentPage, 
    itemsPerPage 
  };
};