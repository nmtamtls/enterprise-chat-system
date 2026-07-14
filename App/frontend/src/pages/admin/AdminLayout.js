import AdminSidebar from "../../components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: 20 }}>
        {children}
      </div>
    </div>
  );
}