import { useSidebar } from "../../context/SidebarContext";
import AdminNavbar from "../AdminNavbar/AdminNavbar";
import AdminSidebar from "../AdminSidebar/AdminSidebar";

// wraps every /admin/* page (except the admin auth pages themselves)
const AdminLayout = ({ children }) => {
  const { isExpanded } = useSidebar();

  return (
    <div className="taskflow-admin-layout">
      <AdminNavbar />
      <AdminSidebar />
      <main
        className="taskflow-admin-layout-content"
        style={{
          marginLeft: isExpanded
            ? "var(--tf-admin-sidebar-width-expanded)"
            : "var(--tf-admin-sidebar-width-collapsed)",
        }}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
