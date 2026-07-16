import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from "lucide-react";
import api from "../../utils/api";

const AdminEmailVerification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification link is invalid or has expired");
      }
    };
    verify();
  }, [token]);

  return (
    <div className="taskflow-adminauth-wrapper">
      <div className="taskflow-adminauth-card">
        <div className="taskflow-adminauth-badge"><ShieldCheck size={13} /> Admin Console</div>

        <div className="taskflow-adminauth-status-box">
          <div className="taskflow-adminauth-status-icon">
            {status === "loading" && <Loader2 size={44} className="taskflow-spin" color="var(--tf-warning)" />}
            {status === "success" && <CheckCircle2 size={44} color="var(--tf-success)" />}
            {status === "error" && <XCircle size={44} color="var(--tf-danger)" />}
          </div>
          <h1 className="taskflow-adminauth-title">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
          </h1>
          <p className="taskflow-adminauth-subtitle">{message}</p>

          {status !== "loading" && (
            <Link to="/admin/login" className="taskflow-adminauth-submit" style={{ textDecoration: "none", display: "inline-flex" }}>
              Go to admin login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminEmailVerification;
