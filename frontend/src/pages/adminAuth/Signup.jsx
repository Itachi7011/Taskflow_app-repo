import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { User, Mail, Lock, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";

const AdminSignup = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ name: "", email: "", password: "", adminCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      // register logs the account in on the backend side of things (it
      // returns a token) but our AuthContext.register() call already
      // stores it for user signups - here we call login right after so
      // AuthContext state gets populated the same way
      await login(form.email, form.password);
      Swal.fire({ icon: "success", title: "Admin account created", confirmButtonColor: "#d97706" });
      navigate("/admin/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Signup failed",
        text: err.response?.data?.message || "Something went wrong",
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
        <h1 className="taskflow-adminauth-title">Request Admin Access</h1>
        <p className="taskflow-adminauth-subtitle">Requires a valid invite code from your team lead</p>

        <form className="taskflow-adminauth-form" onSubmit={handleSubmit}>
          <div className="taskflow-adminauth-field">
            <label htmlFor="name">Full name</label>
            <div className="taskflow-adminauth-input-wrap">
              <User size={16} />
              <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>

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

          <div className="taskflow-adminauth-field">
            <label htmlFor="adminCode">Admin invite code</label>
            <div className="taskflow-adminauth-input-wrap">
              <KeyRound size={16} />
              <input id="adminCode" value={form.adminCode} onChange={(e) => setForm({ ...form, adminCode: e.target.value })} required />
            </div>
          </div>

          <button type="submit" className="taskflow-adminauth-submit" disabled={loading}>
            {loading ? "Creating..." : "Create admin account"}
          </button>
        </form>

        <p className="taskflow-adminauth-footer-text">
          Already have access? <Link to="/admin/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminSignup;
