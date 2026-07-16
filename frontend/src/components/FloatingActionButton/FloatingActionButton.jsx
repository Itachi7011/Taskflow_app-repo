import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, LayoutDashboard, PlusCircle, MessageCircleQuestion } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

// quick actions bubble that sits bottom left (footer already owns
// bottom right for the back-to-top button, so this one lives on the
// opposite side to avoid the two ever overlapping)
const FloatingActionButton = () => {
  const [open, setOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="taskflow-fab-wrapper">
      {open && (
        <div className="taskflow-fab-actions">
          {user && (
            <button className="taskflow-fab-action" onClick={() => go("/dashboard/new")}>
              <PlusCircle size={17} /> New Task
            </button>
          )}
          <button className="taskflow-fab-action" onClick={() => go(user ? "/dashboard" : "/login")}>
            <LayoutDashboard size={17} /> {user ? "Dashboard" : "Login"}
          </button>
          <button className="taskflow-fab-action" onClick={() => go("/faqs")}>
            <MessageCircleQuestion size={17} /> Help / FAQs
          </button>
        </div>
      )}

      <button
        className={`taskflow-fab-main ${open ? "taskflow-fab-main-open" : ""}`}
        onClick={() => setOpen((p) => !p)}
        aria-label="Quick actions"
      >
        {open ? <X size={22} /> : <Plus size={22} />}
      </button>
    </div>
  );
};

export default FloatingActionButton;
