import { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCcw, Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const STATUS_META = {
  pending: { label: "Pending", icon: Clock, className: "taskflow-status-pending" },
  running: { label: "Running", icon: Loader2, className: "taskflow-status-running" },
  success: { label: "Success", icon: CheckCircle2, className: "taskflow-status-success" },
  failed: { label: "Failed", icon: XCircle, className: "taskflow-status-failed" },
};

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data.tasks);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    // simple polling so pending/running tasks update without the user
    // having to manually refresh the page, 4s feels responsive enough
    // for this without hammering the api
    pollRef.current = setInterval(fetchTasks, 4000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pendingCount = tasks.filter((t) => t.status === "pending" || t.status === "running").length;

  return (
    <div className="taskflow-dashboard">
      <div className="taskflow-dashboard-header">
        <div>
          <h1>Hey {user?.name?.split(" ")[0]}, here's your workspace</h1>
          <p>{tasks.length} total tasks · {pendingCount} in progress</p>
        </div>
        <Link to="/dashboard/new" className="taskflow-dashboard-new-btn">
          <Plus size={18} /> New Task
        </Link>
      </div>

      {loading ? (
        <p className="taskflow-dashboard-empty">Loading your tasks...</p>
      ) : tasks.length === 0 ? (
        <div className="taskflow-dashboard-empty-state">
          <p>You haven't run any tasks yet.</p>
          <Link to="/dashboard/new" className="taskflow-dashboard-new-btn">
            <Plus size={18} /> Create your first task
          </Link>
        </div>
      ) : (
        <div className="taskflow-dashboard-table-wrap">
          <table className="taskflow-dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Operation</th>
                <th>Status</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const meta = STATUS_META[task.status];
                const Icon = meta.icon;
                return (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td className="taskflow-dashboard-op-cell">{task.operationType.replace("_", " ")}</td>
                    <td>
                      <span className={`taskflow-status-pill ${meta.className}`}>
                        <Icon size={13} className={task.status === "running" ? "taskflow-spin" : ""} />
                        {meta.label}
                      </span>
                    </td>
                    <td>{new Date(task.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/dashboard/tasks/${task._id}`} className="taskflow-dashboard-view-link">
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button className="taskflow-dashboard-refresh-btn" onClick={fetchTasks} aria-label="Refresh">
        <RefreshCcw size={14} /> Refresh now
      </button>
    </div>
  );
};

export default Dashboard;
