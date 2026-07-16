import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2, Zap } from "lucide-react";
import api from "../../utils/api";

const UserEmailVerification = () => {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
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
    <div className="taskflow-userauth-wrapper">
      <div className="taskflow-userauth-card">
        <div className="taskflow-userauth-logo"><Zap size={22} /> TaskFlow</div>

        <div className="taskflow-userauth-status-box">
          <div className="taskflow-userauth-status-icon">
            {status === "loading" && <Loader2 size={44} className="taskflow-spin" color="var(--tf-primary)" />}
            {status === "success" && <CheckCircle2 size={44} color="var(--tf-success)" />}
            {status === "error" && <XCircle size={44} color="var(--tf-danger)" />}
          </div>
          <h1 className="taskflow-userauth-title">
            {status === "loading" && "Verifying your email..."}
            {status === "success" && "Email verified!"}
            {status === "error" && "Verification failed"}
          </h1>
          <p className="taskflow-userauth-subtitle">{message}</p>

          {status !== "loading" && (
            <Link to="/login" className="taskflow-userauth-submit" style={{ textDecoration: "none", display: "inline-flex" }}>
              Go to login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserEmailVerification;
