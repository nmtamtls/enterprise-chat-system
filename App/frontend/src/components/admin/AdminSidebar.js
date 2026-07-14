import React from "react";
import { 
  DashboardOutlined, 
  UserOutlined, 
  TeamOutlined, 
  MessageOutlined, 
  FileOutlined, 
  WarningOutlined, 
  LogoutOutlined 
} from "@ant-design/icons";

export default function AdminSidebar({ active, setActive }) {
  const navItems = [
    { id: "dashboard", label: "DASHBOARD", icon: <DashboardOutlined /> },
    { id: "users", label: "USERS", icon: <UserOutlined /> },
    { id: "groups", label: "GROUPS", icon: <TeamOutlined /> },
    { id: "messages", label: "MESSAGES", icon: <MessageOutlined /> },
    { id: "files", label: "FILES", icon: <FileOutlined /> },
    { id: "reports", label: "REPORTS", icon: <WarningOutlined /> },
  ];

  return (
    <div className="adminSidebar" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100vh', 
      backgroundColor: '#2b2d31', 
      color: '#dbdee1', 
      width: '240px' 
    }}>
      {/* Container chính chứa Header và Menu - flex: 1 giúp nó chiếm không gian còn lại */}
      <div style={{ flex: 1, padding: '16px' }}>
        <div className="dbHeader" style={{ color: '#fff', paddingBottom: '20px', fontSize: '18px' }}>
          <strong>DB MANAGER</strong>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map(item => (
            <div 
              key={item.id} 
              className={`navItem ${active === item.id ? "active" : ""}`} 
              onClick={() => setActive(item.id)}
              style={{
                padding: '10px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: active === item.id ? '#393c43' : 'transparent',
                color: active === item.id ? '#ffffff' : '#b5bac1',
                transition: 'background 0.2s, color 0.2s'
              }}
              // Thêm hiệu ứng hover đơn giản
              onMouseEnter={(e) => { if(active !== item.id) e.currentTarget.style.backgroundColor = '#35373c'; }}
              onMouseLeave={(e) => { if(active !== item.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {item.icon}
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Phần Footer cố định ở đáy */}
      <div style={{ padding: '16px', borderTop: '1px solid #3f4147' }}>
        <button 
          className="runBtn" 
          style={{ 
            width: "100%", 
            backgroundColor: "transparent", 
            border: "none", 
            color: "#f23f42", 
            cursor: "pointer", 
            display: "flex", 
            alignItems: "center", 
            gap: "10px", 
            padding: "10px", 
            borderRadius: "6px",
            fontSize: "14px", 
            fontWeight: "bold",
            transition: 'background 0.2s'
          }} 
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3f2d2d'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          onClick={() => { 
            localStorage.clear(); 
            window.location.href = "/login"; 
          }}
        >
          <LogoutOutlined /> LOG OUT
        </button>
      </div>
    </div>
  );
}