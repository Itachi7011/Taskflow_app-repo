import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Mail, Lock, Eye, EyeOff, KeyRound, ShieldCheck } from "lucide-react";
import api from "../../utils/api";

const AdminForgotPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setEmailSent(true);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Something went wrong", confirmButtonColor: "#d97706" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirmPassword) {
      Swal.fire({ icon: "warning", title: "Passwords dont match", confirmButtonColor: "#d97706" });
      return;
    }
    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: passwords.password });
      Swal.fire({ icon: "success", title: "Password reset!", confirmButtonColor: "#d97706" });
      navigate("/admin/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Reset failed",
        text: err.response?.data?.message || "Link may have expired",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setLoading(false);
    }
  };

  if (token) {
    return (
      <div className="taskflow-adminauth-wrapper">
        <div className="taskflow-adminauth-card">
          <div className="taskflow-adminauth-badge"><ShieldCheck size={13} /> Admin Console</div>
          <h1 className="taskflow-adminauth-title">Set a new password</h1>

          <form className="taskflow-adminauth-form" onSubmit={handleResetPassword}>
            <div className="taskflow-adminauth-field">
              <label>New password</label>
              <div className="taskflow-adminauth-input-wrap">
                <Lock size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  required
                />
                <button type="button" className="taskflow-adminauth-eye-btn" onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="taskflow-adminauth-field">
              <label>Confirm password</label>
              <div className="taskflow-adminauth-input-wrap">
                <Lock size={16} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="taskflow-adminauth-submit" disabled={loading}>
              <KeyRound size={17} /> {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="taskflow-adminauth-wrapper">
      <div className="taskflow-adminauth-card">
        <div className="taskflow-adminauth-badge"><ShieldCheck size={13} /> Admin Console</div>
        <h1 className="taskflow-adminauth-title">Forgot your password?</h1>
        <p className="taskflow-adminauth-subtitle">
          {emailSent ? "If an admin account exists for that email, a reset link is on its way." : "Enter your admin email"}
        </p>

        {!emailSent && (
          <form className="taskflow-adminauth-form" onSubmit={handleRequestReset}>
            <div className="taskflow-adminauth-field">
              <label>Email</label>
              <div className="taskflow-adminauth-input-wrap">
                <Mail size={16} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="taskflow-adminauth-submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="taskflow-adminauth-footer-text">
          <Link to="/admin/login">Back to admin login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminForgotPassword;
