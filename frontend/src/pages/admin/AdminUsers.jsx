import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { Ban, CheckCircle } from "lucide-react";
import api from "../../utils/api";
import AdminLayout from "../../components/AdminLayout/AdminLayout";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => {
    api
      .get("/admin/users")
      .then((res) => setUsers(res.data.users))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadUsers, []);

  const handleToggleBlock = async (user) => {
    const confirm = await Swal.fire({
      icon: "warning",
      title: user.isBlocked ? "Unblock this user?" : "Block this user?",
      showCancelButton: true,
      confirmButtonColor: "#d97706",
    });
    if (!confirm.isConfirmed) return;

    try {
      await api.patch(`/admin/users/${user._id}/block`);
      loadUsers();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Action failed", confirmButtonColor: "#d97706" });
    }
  };

  return (
    <AdminLayout>
      <div className="taskflow-adminusers">
        <h1>All Users</h1>
        <p className="taskflow-adminusers-subtitle">{users.length} registered users</p>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="taskflow-adminusers-table-wrap">
            <table className="taskflow-adminusers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td className="taskflow-adminusers-role">{u.role}</td>
                    <td>
                      <span className={`taskflow-adminusers-badge ${u.isBlocked ? "blocked" : "active"}`}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="taskflow-adminusers-action-btn" onClick={() => handleToggleBlock(u)}>
                        {u.isBlocked ? <CheckCircle size={14} /> : <Ban size={14} />}
                        {u.isBlocked ? "Unblock" : "Block"}
                      </button>
                    </td>
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

export default AdminUsers;
