import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../utils/api";
import AdminLayout from "../../components/AdminLayout/AdminLayout";

const AdminTasks = () => {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const searchTerm = searchParams.get("search")?.toLowerCase();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/tasks")
      .then((res) => setTasks(res.data.tasks))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) => {
    if (statusFilter === "pending" && !["pending", "running"].includes(t.status)) return false;
    if (statusFilter === "success" && t.status !== "success") return false;
    if (statusFilter === "failed" && t.status !== "failed") return false;
    if (searchTerm && !t.title.toLowerCase().includes(searchTerm) && !t.owner?.email?.toLowerCase().includes(searchTerm)) {
      return false;
    }
    return true;
  });

  return (
    <AdminLayout>
      <div className="taskflow-admintasks">
        <h1>All Tasks</h1>
        <p className="taskflow-admintasks-subtitle">{filtered.length} of {tasks.length} tasks shown</p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="taskflow-admintasks-table-wrap">
            <table className="taskflow-admintasks-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Owner</th>
                  <th>Operation</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((task) => (
                  <tr key={task._id}>
                    <td>{task.title}</td>
                    <td>{task.owner?.name} <span className="taskflow-admintasks-email">({task.owner?.email})</span></td>
                    <td className="taskflow-admintasks-op">{task.operationType.replace("_", " ")}</td>
                    <td>
                      <span className={`taskflow-status-pill taskflow-status-${task.status}`}>{task.status}</span>
                    </td>
                    <td>{new Date(task.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTasks;
