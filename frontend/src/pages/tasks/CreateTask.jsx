import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Type, CaseLower, ArrowLeftRight, Hash, PlayCircle } from "lucide-react";
import api from "../../utils/api";

const OPERATIONS = [
  { value: "uppercase", label: "Uppercase", icon: Type, desc: "Convert all characters to uppercase" },
  { value: "lowercase", label: "Lowercase", icon: CaseLower, desc: "Convert all characters to lowercase" },
  { value: "reverse", label: "Reverse String", icon: ArrowLeftRight, desc: "Reverse the input string" },
  { value: "word_count", label: "Word Count", icon: Hash, desc: "Return the total number of words" },
];

const CreateTask = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", inputText: "", operationType: "uppercase" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/tasks", form);
      Swal.fire({ icon: "success", title: "Task queued!", text: "Your task is now processing in the background", confirmButtonColor: "#6d28d9" });
      navigate(`/dashboard/tasks/${res.data.task._id}`);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Couldn't create task",
        text: err.response?.data?.message || "Something went wrong",
        confirmButtonColor: "#6d28d9",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="taskflow-createtask">
      <h1>Run a new task</h1>
      <p className="taskflow-createtask-subtitle">Pick an operation, paste your text, and click run</p>

      <form className="taskflow-createtask-form" onSubmit={handleSubmit}>
        <div className="taskflow-createtask-field">
          <label htmlFor="title">Task title</label>
          <input
            id="title"
            type="text"
            placeholder="e.g. Clean up product descriptions"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="taskflow-createtask-field">
          <label>Operation type</label>
          <div className="taskflow-createtask-ops-grid">
            {OPERATIONS.map((op) => {
              const Icon = op.icon;
              const active = form.operationType === op.value;
              return (
                <button
                  type="button"
                  key={op.value}
                  className={`taskflow-createtask-op-card ${active ? "taskflow-createtask-op-active" : ""}`}
                  onClick={() => setForm({ ...form, operationType: op.value })}
                >
                  <Icon size={20} />
                  <span>{op.label}</span>
                  <small>{op.desc}</small>
                </button>
              );
            })}
          </div>
        </div>

        <div className="taskflow-createtask-field">
          <label htmlFor="inputText">Input text</label>
          <textarea
            id="inputText"
            rows={8}
            placeholder="Paste or type the text you want processed..."
            value={form.inputText}
            onChange={(e) => setForm({ ...form, inputText: e.target.value })}
            required
          />
        </div>

        <button type="submit" className="taskflow-createtask-submit" disabled={loading}>
          <PlayCircle size={18} /> {loading ? "Queuing task..." : "Run Task"}
        </button>
      </form>
    </div>
  );
};

export default CreateTask;
