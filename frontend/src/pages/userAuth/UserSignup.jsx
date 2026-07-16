import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Zap } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const UserSignup = () => {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password.length < 8) {
      Swal.fire({
        icon: "warning",
        title: "Weak password",
        text: "Password needs to be atleast 8 characters long",
        confirmButtonColor: "#6d28d9",
      });
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      Swal.fire({
        icon: "success",
        title: "Account created!",
        text: "We sent a verification link to your email",
        confirmButtonColor: "#6d28d9",
      });
      navigate("/dashboard");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Signup failed",
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
        <h1 className="taskflow-userauth-title">Create your account</h1>
        <p className="taskflow-userauth-subtitle">Start automating text tasks in minutes</p>

        <form className="taskflow-userauth-form" onSubmit={handleSubmit}>
          <div className="taskflow-userauth-field">
            <label htmlFor="name">Full name</label>
            <div className="taskflow-userauth-input-wrap">
              <User size={16} />
              <input id="name" type="text" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="taskflow-userauth-field">
            <label htmlFor="email">Email</label>
            <div className="taskflow-userauth-input-wrap">
              <Mail size={16} />
              <input id="email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
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
                placeholder="Atleast 8 characters"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="taskflow-userauth-eye-btn" onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="taskflow-userauth-submit" disabled={loading}>
            <UserPlus size={17} /> {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        <p className="taskflow-userauth-footer-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default UserSignup;
