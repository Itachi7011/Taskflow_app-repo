import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Zap, ChevronUp, ChevronDown, ArrowUp, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { ThemeContext } from "../../context/ThemeContext";

const Footer = () => {
  const { isDarkMode } = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(true);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className={`taskflow-footer ${isDarkMode ? "dark" : "light"}`}>
      <button
        className="taskflow-footer-back-to-top"
        onClick={scrollToTop}
        aria-label="Back to top"
      >
        <ArrowUp size={18} />
      </button>

      <div className="taskflow-footer-toggle-row">
        <button
          className="taskflow-footer-toggle"
          onClick={() => setExpanded((p) => !p)}
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          {expanded ? "Collapse footer" : "Expand footer"}
        </button>
      </div>

      {expanded && (
        <div className="taskflow-footer-body">
          <div className="taskflow-footer-col taskflow-footer-brand-col">
            <div className="taskflow-footer-logo">
              <Zap size={20} /> TaskFlow
            </div>
            <p>
              TaskFlow is an AI powered task processing platform that lets you queue up text
              operations and watch them run asynchronously, in real time, from anywhere.
            </p>
            <div className="taskflow-footer-socials">
              <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Github"><Github size={17} /></a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><Twitter size={17} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={17} /></a>
              <a href="mailto:support@taskflow.dev" aria-label="Email"><Mail size={17} /></a>
            </div>
          </div>

          <div className="taskflow-footer-col">
            <h4>Product</h4>
            <Link to="/services">Services</Link>
            <Link to="/coming-soon">Roadmap</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/signup">Get Started</Link>
          </div>

          <div className="taskflow-footer-col">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact Us</Link>
            <Link to="/faqs">FAQs</Link>
            <Link to="/report-issue">Report an Issue</Link>
          </div>

          <div className="taskflow-footer-col">
            <h4>Legal</h4>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/privacy-policy">Privacy Policy</Link>
          </div>

          <div className="taskflow-footer-col">
            <h4>Account</h4>
            <Link to="/login">User Login</Link>
            <Link to="/signup">User Signup</Link>
            <Link to="/admin/login">Admin Login</Link>
          </div>
        </div>
      )}

      <div className="taskflow-footer-bottom">
        <span>© {new Date().getFullYear()} TaskFlow. All rights reserved.</span>
        <span>Built with the MERN stack + Python.</span>
      </div>
    </footer>
  );
};

export default Footer;
