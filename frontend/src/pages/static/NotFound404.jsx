import { Link } from "react-router-dom";
import { Home, Search, Compass } from "lucide-react";

const NotFound404 = () => {
  return (
    <div className="taskflow-404">
      <div className="taskflow-404-glow" />
      <p className="taskflow-404-code">404</p>
      <h1>This page took a wrong turn</h1>
      <p className="taskflow-404-desc">
        The page you're looking for doesn't exist, was moved, or the URL was typed incorrectly.
        Let's get you back on track.
      </p>

      <div className="taskflow-404-actions">
        <Link to="/" className="taskflow-404-btn-primary">
          <Home size={17} /> Back to home
        </Link>
        <Link to="/dashboard" className="taskflow-404-btn-secondary">
          <Compass size={17} /> Go to dashboard
        </Link>
        <Link to="/faqs" className="taskflow-404-btn-secondary">
          <Search size={17} /> Browse FAQs
        </Link>
      </div>
    </div>
  );
};

export default NotFound404;
