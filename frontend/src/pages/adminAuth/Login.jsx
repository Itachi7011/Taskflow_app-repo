import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const AdminLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user.role !== "admin") {
        Swal.fire({
          icon: "error",
          title: "Not an admin account",
          text: "This login is only for administrators",
          confirmButtonColor: "#d97706",
        });
        return;
      }
      navigate("/admin/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.response?.data?.message || "Invalid credentials",
        confirmButtonColor: "#d97706",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="taskflow-adminauth-wrapper">
      <div className="taskflow-adminauth-card">
        <div className="taskflow-adminauth-badge"><ShieldCheck size={13} /> Admin Console</div>
        <h1 className="taskflow-adminauth-title">Administrator Login</h1>
        <p className="taskflow-adminauth-subtitle">Authorized personnel only</p>

        <form className="taskflow-adminauth-form" onSubmit={handleSubmit}>
          <div className="taskflow-adminauth-field">
            <label htmlFor="email">Email</label>
            <div className="taskflow-adminauth-input-wrap">
              <Mail size={16} />
              <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
          </div>

          <div className="taskflow-adminauth-field">
            <label htmlFor="password">Password</label>
            <div className="taskflow-adminauth-input-wrap">
              <Lock size={16} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" className="taskflow-adminauth-eye-btn" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="taskflow-adminauth-links-row">
            <span />
            <Link to="/admin/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="taskflow-adminauth-submit" disabled={loading}>
            {loading ? "Verifying..." : "Login as Admin"}
          </button>
        </form>

        <p className="taskflow-adminauth-footer-text">
          Need an admin account? <Link to="/admin/signup">Request access</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
