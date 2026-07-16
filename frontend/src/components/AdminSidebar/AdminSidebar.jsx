import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Users,
  ChevronDown,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  CircleCheck,
  CircleX,
  Clock,
} from "lucide-react";
import { useSidebar } from "../../context/SidebarContext";

const AdminSidebar = () => {
  const { isExpanded, toggleSidebar } = useSidebar();
  const [tasksOpen, setTasksOpen] = useState(true);
  const [usersOpen, setUsersOpen] = useState(false);

  return (
    <aside className={`taskflow-admin-sidebar ${isExpanded ? "taskflow-admin-sidebar-expanded" : "taskflow-admin-sidebar-collapsed"}`}>
      <div className="taskflow-admin-sidebar-top">
        <button
          className="taskflow-admin-sidebar-collapse-btn"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {isExpanded ? <PanelLeftClose size={19} /> : <PanelLeftOpen size={19} />}
        </button>
      </div>

      <nav className="taskflow-admin-sidebar-nav">
        <NavLink to="/admin/dashboard" className="taskflow-admin-sidebar-item">
          <LayoutDashboard size={19} />
          {isExpanded && <span>Dashboard</span>}
        </NavLink>

        {/* group with sub options - "Tasks" itself has no link, its just a toggle */}
        <button className="taskflow-admin-sidebar-item taskflow-admin-sidebar-group-btn" onClick={() => setTasksOpen((p) => !p)}>
          <ListChecks size={19} />
          {isExpanded && (
            <>
              <span>Tasks</span>
              <ChevronDown size={15} className={`taskflow-admin-sidebar-caret ${tasksOpen ? "open" : ""}`} />
            </>
          )}
        </button>
        {isExpanded && tasksOpen && (
          <div className="taskflow-admin-sidebar-subgroup">
            <NavLink to="/admin/tasks" end className="taskflow-admin-sidebar-subitem">
              <ListChecks size={15} /> All Tasks
            </NavLink>
            <NavLink to="/admin/tasks?status=success" className="taskflow-admin-sidebar-subitem">
              <CircleCheck size={15} /> Successful
            </NavLink>
            <NavLink to="/admin/tasks?status=failed" className="taskflow-admin-sidebar-subitem">
              <CircleX size={15} /> Failed
            </NavLink>
            <NavLink to="/admin/tasks?status=pending" className="taskflow-admin-sidebar-subitem">
              <Clock size={15} /> Pending / Running
            </NavLink>
          </div>
        )}

        <button className="taskflow-admin-sidebar-item taskflow-admin-sidebar-group-btn" onClick={() => setUsersOpen((p) => !p)}>
          <Users size={19} />
          {isExpanded && (
            <>
              <span>Users</span>
              <ChevronDown size={15} className={`taskflow-admin-sidebar-caret ${usersOpen ? "open" : ""}`} />
            </>
          )}
        </button>
        {isExpanded && usersOpen && (
          <div className="taskflow-admin-sidebar-subgroup">
            <NavLink to="/admin/users" end className="taskflow-admin-sidebar-subitem">
              <Users size={15} /> All Users
            </NavLink>
          </div>
        )}

        <NavLink to="/admin/settings" className="taskflow-admin-sidebar-item">
          <Settings size={19} />
          {isExpanded && <span>Settings</span>}
        </NavLink>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
