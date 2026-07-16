import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Mail, Lock, Eye, EyeOff, KeyRound, Zap } from "lucide-react";
import api from "../../utils/api";

// this single page handles both steps:
//   /forgot-password        -> ask for email, sends reset link
//   /reset-password/:token  -> shows new password form
const UserForgotPassword = () => {
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
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: err.response?.data?.message || "Please try again in a moment",
        confirmButtonColor: "#6d28d9",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwords.password !== passwords.confirmPassword) {
      Swal.fire({ icon: "warning", title: "Passwords dont match", confirmButtonColor: "#6d28d9" });
      return;
    }
    if (passwords.password.length < 8) {
      Swal.fire({ icon: "warning", title: "Password too short", text: "Needs to be atleast 8 characters", confirmButtonColor: "#6d28d9" });
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${token}`, { password: passwords.password });
      Swal.fire({ icon: "success", title: "Password reset!", text: "You can login with your new password now", confirmButtonColor: "#6d28d9" });
      navigate("/login");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Reset failed",
        text: err.response?.data?.message || "Link may have expired, request a new one",
        confirmButtonColor: "#6d28d9",
      });
    } finally {
      setLoading(false);
    }
  };

  // ---- reset mode (token present in url) ----
  if (token) {
    return (
      <div className="taskflow-userauth-wrapper">
        <div className="taskflow-userauth-card">
          <div className="taskflow-userauth-logo"><Zap size={22} /> TaskFlow</div>
          <h1 className="taskflow-userauth-title">Set a new password</h1>
          <p className="taskflow-userauth-subtitle">Make sure its something you'll remember</p>

          <form className="taskflow-userauth-form" onSubmit={handleResetPassword}>
            <div className="taskflow-userauth-field">
              <label htmlFor="password">New password</label>
              <div className="taskflow-userauth-input-wrap">
                <Lock size={16} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={passwords.password}
                  onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                  required
                />
                <button type="button" className="taskflow-userauth-eye-btn" onClick={() => setShowPassword((p) => !p)}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="taskflow-userauth-field">
              <label htmlFor="confirmPassword">Confirm new password</label>
              <div className="taskflow-userauth-input-wrap">
                <Lock size={16} />
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="taskflow-userauth-submit" disabled={loading}>
              <KeyRound size={17} /> {loading ? "Resetting..." : "Reset password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ---- request mode ----
  return (
    <div className="taskflow-userauth-wrapper">
      <div className="taskflow-userauth-card">
        <div className="taskflow-userauth-logo"><Zap size={22} /> TaskFlow</div>
        <h1 className="taskflow-userauth-title">Forgot your password?</h1>
        <p className="taskflow-userauth-subtitle">
          {emailSent
            ? "If an account exists for that email, a reset link is on its way."
            : "Enter your email and we'll send you a reset link"}
        </p>

        {!emailSent && (
          <form className="taskflow-userauth-form" onSubmit={handleRequestReset}>
            <div className="taskflow-userauth-field">
              <label htmlFor="email">Email</label>
              <div className="taskflow-userauth-input-wrap">
                <Mail size={16} />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="taskflow-userauth-submit" disabled={loading}>
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}

        <p className="taskflow-userauth-footer-text">
          Remembered it? <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserForgotPassword;
