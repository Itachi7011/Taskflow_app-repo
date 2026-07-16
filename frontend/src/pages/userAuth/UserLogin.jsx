import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Mail, Lock, Eye, EyeOff, LogIn, Zap } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const UserLogin = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Login failed",
        text: err.response?.data?.message || "Something went wrong, please try again",
        confirmButtonColor: "#6d28d9",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="taskflow-userauth-wrapper">
      <div className="taskflow-userauth-card">
        <div className="taskflow-userauth-logo">
          <Zap size={22} /> TaskFlow
        </div>
        <h1 className="taskflow-userauth-title">Welcome back</h1>
        <p className="taskflow-userauth-subtitle">Log in to run and monitor your AI tasks</p>

        <form className="taskflow-userauth-form" onSubmit={handleSubmit}>
          <div className="taskflow-userauth-field">
            <label htmlFor="email">Email</label>
            <div className="taskflow-userauth-input-wrap">
              <Mail size={16} />
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="taskflow-userauth-field">
            <label htmlFor="password">Password</label>
            <div className="taskflow-userauth-input-wrap">
              <Lock size={16} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="taskflow-userauth-eye-btn"
                onClick={() => setShowPassword((p) => !p)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="taskflow-userauth-links-row">
            <span />
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="taskflow-userauth-submit" disabled={loading}>
            <LogIn size={17} /> {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="taskflow-userauth-footer-text">
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default UserLogin;
