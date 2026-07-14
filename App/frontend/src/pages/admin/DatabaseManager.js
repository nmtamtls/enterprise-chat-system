

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/layout/AdminSidebar';
import adminApi from '../../api/adminApi';
import styles from '../../styles/admin.module.css';
// Import các bảng đã có
import { TableFiles, TableUsers, TableMessages, TableGroups } from '../../components/admin/TableComponents'; 

const DatabaseManager = () => {
    // Danh sách các bảng (tables) tương ứng với các menu sidebar
    const [tables] = useState(['users', 'messages', 'conversations', 'files', 'attachments']);
    const [selectedTable, setSelectedTable] = useState('users');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    const fetchData = async () => {
        setLoading(true);
        try {
            // Giả định adminApi trả về dữ liệu chuẩn
            const res = await adminApi.getTableData(selectedTable);
            setTableData(res.data || []);
        } catch (err) {
            console.error("Lỗi lấy dữ liệu:", err);
            setTableData([]); // Reset về mảng rỗng nếu lỗi
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedTable]);

    const handleDelete = async (id) => {
        const confirmMessage = selectedTable === 'conversations' 
            ? "Bạn có chắc chắn muốn GIẢI TÁN nhóm này? Hành động này không thể hoàn tác."
            : `Bạn có chắc chắn muốn xóa mục có ID: ${id.toString().substring(0, 8)}... không?`;

        if (!window.confirm(confirmMessage)) return;

        try {
            setLoading(true);
            // Lưu ý: Endpoint xóa cần phải đồng bộ với backend của bạn
            await axios.delete(`http://localhost:8082/api/admin/${selectedTable}/${id}`, {
            //   await axios.delete(`https://tqgwvv8g-8082.asse.devtunnels.ms/api/admin/${selectedTable}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setTableData(prevData => prevData.filter(item => {
                const currentId = item.id || item.fileId || item.conversationId || (item.conversation?.id) || item._id;
                return currentId !== id;
            }));
            
            alert("Xóa thành công!");
        } catch (err) {
            console.error("Lỗi xóa:", err);
            alert(err.response?.data?.message || "Xóa thất bại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.adminWrapper}>
            <AdminSidebar 
                tables={tables} 
                selectedTable={selectedTable}
                onTableSelect={setSelectedTable}
            />
            
            <div className={styles.mainContent}>
                <header className={styles.contentHeader}>
                    <div className={styles.headerTitle}>
                        <span className={styles.headerHash}>#</span>
                        <h2>{selectedTable}</h2>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.refreshBtn} onClick={fetchData} disabled={loading}>
                            {loading ? "Loading..." : "Refresh Data"}
                        </button>
                    </div>
                </header>

                <main className={styles.tableArea}>
                    <div className={styles.queryBar}>
                        <code>SELECT * FROM {selectedTable};</code>
                    </div>

                    {loading ? (
                        <div style={{ padding: "20px", color: "#fff" }}>Đang tải dữ liệu...</div>
                    ) : (
                        renderTableComponent(selectedTable, tableData, handleDelete)
                    )}
                </main>
            </div>
        </div>
    );
};

// Hàm helper để render bảng tương ứng
const renderTableComponent = (tableType, data, onDelete) => {
    switch (tableType) {
        case 'files':
            return <TableFiles data={data} onDelete={onDelete} />;
        case 'users':
            return <TableUsers data={data} onDelete={onDelete} onBlock={(id) => console.log("Block:", id)} onUnblock={(id) => console.log("Unblock:", id)} />;
        case 'messages':
            return <TableMessages data={data} onDelete={onDelete} />;
        case 'conversations':
            return <TableGroups data={data} onDelete={onDelete} />;
        
        case 'reports':
            return <TableReports data={data} onDelete={onDelete}/>;
                
        default:
            return <div style={{ padding: "20px", color: "#aaa" }}>Bảng {tableType} chưa cấu hình hiển thị.</div>;
    }
};

export default DatabaseManager;