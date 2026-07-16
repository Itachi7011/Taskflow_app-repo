import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  Zap,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldAlert,
  UserPlus,
  LogIn,
} from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [companyOpen, setCompanyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // this is the "restricted area" gate mentioned in the spec - clicking
  // an admin link never navigates straight away, it warns first
  const handleAdminClick = (e, path) => {
    e.preventDefault();
    setAdminOpen(false);
    Swal.fire({
      icon: "warning",
      title: "Restricted Area",
      text: "This section is reserved for authenticated administrators only. Unauthorized access attempts may be logged and reviewed.",
      showCancelButton: true,
      confirmButtonText: "I understand, continue",
      cancelButtonText: "Take me back",
      confirmButtonColor: "#6d28d9",
      cancelButtonColor: "#64748b",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate(path);
      }
    });
  };

  return (
    <nav className={`taskflow-navbar ${isDarkMode ? "dark" : "light"}`}>
      <div className="taskflow-navbar-inner">
        <Link
          to="/"
          className="taskflow-navbar-logo"
          onClick={() => setMobileOpen(false)}
        >
          <span className="taskflow-navbar-logo-icon">
            <Zap size={22} strokeWidth={2.4} />
          </span>
          <span className="taskflow-navbar-logo-text">TaskFlow</span>
        </Link>

        <div
          className={`taskflow-navbar-links ${mobileOpen ? "taskflow-navbar-links-open" : ""}`}
        >
          <Link
            to="/"
            className="taskflow-navbar-link"
            onClick={() => setMobileOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/services"
            className="taskflow-navbar-link"
            onClick={() => setMobileOpen(false)}
          >
            Services
          </Link>

          {/* company dropdown - simple set of links, nothing nested here */}
          <div
            className="taskflow-navbar-dropdown"
            onMouseEnter={() => setCompanyOpen(true)}
            onMouseLeave={() => setCompanyOpen(false)}
          >
            <button
              className="taskflow-navbar-dropdown-trigger"
              onClick={() => setCompanyOpen((p) => !p)}
              aria-expanded={companyOpen}
            >
              Company{" "}
              <ChevronDown
                size={16}
                className={companyOpen ? "taskflow-chevron-open" : ""}
              />
            </button>
            {companyOpen && (
              <div className="taskflow-navbar-dropdown-menu">
                <Link to="/about" onClick={() => setCompanyOpen(false)}>
                  About Us
                </Link>
                <Link to="/contact" onClick={() => setCompanyOpen(false)}>
                  Contact Us
                </Link>
                <Link to="/faqs" onClick={() => setCompanyOpen(false)}>
                  FAQs
                </Link>
                <Link to="/terms" onClick={() => setCompanyOpen(false)}>
                  Terms
                </Link>
                <Link
                  to="/privacy-policy"
                  onClick={() => setCompanyOpen(false)}
                >
                  Privacy Policy
                </Link>
                <Link to="/coming-soon" onClick={() => setCompanyOpen(false)}>
                  Coming Soon
                </Link>
                <Link to="/report-issue" onClick={() => setCompanyOpen(false)}>
                  Report Issue
                </Link>
              </div>
            )}
          </div>

          {user ? (
            <div
              className="taskflow-navbar-dropdown"
              onMouseEnter={() => setAuthOpen(true)}
              onMouseLeave={() => setAuthOpen(false)}
            >
              <button
                className="taskflow-navbar-dropdown-trigger"
                onClick={() => setAuthOpen((p) => !p)}
              >
                {user.name?.split(" ")[0]}{" "}
                <ChevronDown
                  size={16}
                  className={authOpen ? "taskflow-chevron-open" : ""}
                />
              </button>
              {authOpen && (
                <div className="taskflow-navbar-dropdown-menu">
                  <Link to="/dashboard" onClick={() => setAuthOpen(false)}>
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="taskflow-navbar-dropdown-logout"
                  >
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div
              className="taskflow-navbar-dropdown"
              onMouseEnter={() => setAuthOpen(true)}
              onMouseLeave={() => setAuthOpen(false)}
            >
              <button
                className="taskflow-navbar-dropdown-trigger"
                onClick={() => setAuthOpen((p) => !p)}
              >
                Account{" "}
                <ChevronDown
                  size={16}
                  className={authOpen ? "taskflow-chevron-open" : ""}
                />
              </button>
              {authOpen && (
                <div className="taskflow-navbar-dropdown-menu">
                  <Link to="/login" onClick={() => setAuthOpen(false)}>
                    <LogIn size={15} /> User Login
                  </Link>
                  <Link to="/signup" onClick={() => setAuthOpen(false)}>
                    <UserPlus size={15} /> User Signup
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* admin dropdown - both options are gated by the sweetalert warning */}
          <div
            className="taskflow-navbar-dropdown"
            onMouseEnter={() => setAdminOpen(true)}
            onMouseLeave={() => setAdminOpen(false)}
          >
            <button
              className="taskflow-navbar-dropdown-trigger"
              onClick={() => setAdminOpen((p) => !p)}
            >
              <ShieldAlert size={16} /> Admin{" "}
              <ChevronDown
                size={16}
                className={adminOpen ? "taskflow-chevron-open" : ""}
              />
            </button>
            {adminOpen && (
              <div className="taskflow-navbar-dropdown-menu">
                <a
                  href="/admin/login"
                  onClick={(e) => handleAdminClick(e, "/admin/login")}
                >
                  Admin Login
                </a>
                <a
                  href="/admin/signup"
                  onClick={(e) => handleAdminClick(e, "/admin/signup")}
                >
                  Admin Signup
                </a>
              </div>
            )}
          </div>

          <button
            className="taskflow-navbar-theme-toggle"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <button
          className="taskflow-navbar-mobile-toggle"
          onClick={() => setMobileOpen((p) => !p)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
