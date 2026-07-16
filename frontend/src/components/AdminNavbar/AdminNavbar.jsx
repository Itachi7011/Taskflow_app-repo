import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Search,
  ChevronDown,
  LogOut,
  UserCog,
  Sun,
  Moon,
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const AdminNavbar = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [search, setSearch] = useState("");

  // fake unread count just for the demo badge, a real app would pull
  // this from an endpoint/websocket
  const unreadCount = 3;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/admin/tasks?search=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  return (
    <header className={`taskflow-admin-navbar ${isDarkMode ? "dark" : "light"}`}>
      <button
        className="taskflow-admin-navbar-collapse-btn"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isExpanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
      </button>

      <form className="taskflow-admin-navbar-search" onSubmit={handleSearchSubmit}>
        <Search size={16} />
        <input
          type="text"
          placeholder="Search tasks, users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search"
        />
      </form>

      <div className="taskflow-admin-navbar-right">
        <button className="taskflow-admin-navbar-icon-btn" onClick={toggleDarkMode} aria-label="Toggle theme">
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className="taskflow-admin-navbar-icon-btn taskflow-admin-navbar-bell" aria-label="Notifications">
          <Bell size={18} />
          {unreadCount > 0 && <span className="taskflow-admin-navbar-badge">{unreadCount}</span>}
        </button>

        <div className="taskflow-admin-navbar-profile">
          <button
            className="taskflow-admin-navbar-profile-btn"
            onClick={() => setProfileOpen((p) => !p)}
            aria-expanded={profileOpen}
          >
            <span className="taskflow-admin-navbar-avatar">{user?.name?.[0]?.toUpperCase() || "A"}</span>
            <span className="taskflow-admin-navbar-name">{user?.name || "Admin"}</span>
            <ChevronDown size={14} className={profileOpen ? "taskflow-chevron-open" : ""} />
          </button>

          {profileOpen && (
            <div className="taskflow-admin-navbar-profile-menu">
              <button onClick={() => { setProfileOpen(false); navigate("/admin/settings"); }}>
                <UserCog size={15} /> Account Settings
              </button>
              <button onClick={handleLogout} className="taskflow-admin-navbar-logout">
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
