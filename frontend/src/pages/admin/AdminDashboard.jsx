import { useEffect, useState } from "react";
import { Users, ListChecks, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "../../utils/api";
import AdminLayout from "../../components/AdminLayout/AdminLayout";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/admin/stats").then((res) => setStats(res.data.stats)).catch(console.error);
  }, []);

  const cards = stats
    ? [
        { label: "Total Users", value: stats.totalUsers, icon: Users, color: "var(--tf-primary)" },
        { label: "Total Tasks", value: stats.totalTasks, icon: ListChecks, color: "var(--tf-accent)" },
        { label: "Pending", value: stats.pending, icon: Clock, color: "var(--tf-warning)" },
        { label: "Running", value: stats.running, icon: Loader2, color: "var(--tf-accent)" },
        { label: "Successful", value: stats.success, icon: CheckCircle2, color: "var(--tf-success)" },
        { label: "Failed", value: stats.failed, icon: XCircle, color: "var(--tf-danger)" },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="taskflow-admindash">
        <h1>Admin Overview</h1>
        <p className="taskflow-admindash-subtitle">A birds eye view of everything happening on TaskFlow</p>

        <div className="taskflow-admindash-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div className="taskflow-admindash-card" key={card.label}>
                <div className="taskflow-admindash-card-icon" style={{ color: card.color }}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="taskflow-admindash-card-value">{card.value ?? "-"}</p>
                  <p className="taskflow-admindash-card-label">{card.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
