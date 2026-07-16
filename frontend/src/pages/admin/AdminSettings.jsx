import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminLayout from "../../components/AdminLayout/AdminLayout";

const AdminSettings = () => {
  const { user } = useContext(AuthContext);

  return (
    <AdminLayout>
      <div className="taskflow-adminsettings">
        <h1>Account Settings</h1>
        <p className="taskflow-adminsettings-subtitle">Your admin account details</p>

        <div className="taskflow-adminsettings-card">
          <div className="taskflow-adminsettings-row">
            <span>Name</span>
            <span>{user?.name}</span>
          </div>
          <div className="taskflow-adminsettings-row">
            <span>Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="taskflow-adminsettings-row">
            <span>Role</span>
            <span className="taskflow-adminsettings-role">{user?.role}</span>
          </div>
          <div className="taskflow-adminsettings-row">
            <span>Email verified</span>
            <span>{user?.emailVerified ? "Yes" : "No"}</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
