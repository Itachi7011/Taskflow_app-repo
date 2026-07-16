import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { ArrowLeft, RotateCw, Clock, Loader2, CheckCircle2, XCircle, Copy } from "lucide-react";
import api from "../../utils/api";

const STATUS_META = {
  pending: { label: "Pending", icon: Clock, className: "taskflow-status-pending" },
  running: { label: "Running", icon: Loader2, className: "taskflow-status-running" },
  success: { label: "Success", icon: CheckCircle2, className: "taskflow-status-success" },
  failed: { label: "Failed", icon: XCircle, className: "taskflow-status-failed" },
};

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollRef = useRef(null);

  const fetchTask = async () => {
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data.task);
    } catch (err) {
      console.error("Failed to load task", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    pollRef.current = setInterval(fetchTask, 3000);
    return () => clearInterval(pollRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // once its done, no point still polling every 3s
  useEffect(() => {
    if (task && (task.status === "success" || task.status === "failed")) {
      clearInterval(pollRef.current);
    }
  }, [task]);

  const handleRerun = async () => {
    try {
      const res = await api.post(`/tasks/${id}/rerun`);
      setTask(res.data.task);
      pollRef.current = setInterval(fetchTask, 3000);
      Swal.fire({ icon: "success", title: "Task re-queued", confirmButtonColor: "#6d28d9" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Couldn't rerun task", confirmButtonColor: "#6d28d9" });
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(task.result || "");
    Swal.fire({ icon: "success", title: "Copied!", timer: 1200, showConfirmButton: false });
  };

  if (loading) return <p className="taskflow-taskdetail-loading">Loading task...</p>;
  if (!task) return <p className="taskflow-taskdetail-loading">Task not found.</p>;

  const meta = STATUS_META[task.status];
  const Icon = meta.icon;

  return (
    <div className="taskflow-taskdetail">
      <Link to="/dashboard" className="taskflow-taskdetail-back">
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      <div className="taskflow-taskdetail-header">
        <div>
          <h1>{task.title}</h1>
          <p className="taskflow-taskdetail-op">{task.operationType.replace("_", " ")}</p>
        </div>
        <span className={`taskflow-status-pill ${meta.className}`}>
          <Icon size={14} className={task.status === "running" ? "taskflow-spin" : ""} />
          {meta.label}
        </span>
      </div>

      <div className="taskflow-taskdetail-grid">
        <div className="taskflow-taskdetail-card">
          <h3>Input text</h3>
          <pre>{task.inputText}</pre>
        </div>

        <div className="taskflow-taskdetail-card">
          <div className="taskflow-taskdetail-card-header">
            <h3>Result</h3>
            {task.result && (
              <button onClick={copyResult} className="taskflow-taskdetail-copy-btn">
                <Copy size={14} /> Copy
              </button>
            )}
          </div>
          {task.status === "failed" ? (
            <p className="taskflow-taskdetail-error">{task.errorMessage}</p>
          ) : (
            <pre>{task.result || "Waiting for the worker to finish..."}</pre>
          )}
        </div>

        <div className="taskflow-taskdetail-card taskflow-taskdetail-logs-card">
          <h3>Execution logs</h3>
          <ul>
            {task.logs?.map((log, i) => (
              <li key={i}>{log}</li>
            ))}
          </ul>
        </div>
      </div>

      {(task.status === "failed" || task.status === "success") && (
        <button className="taskflow-taskdetail-rerun-btn" onClick={handleRerun}>
          <RotateCw size={16} /> Rerun this task
        </button>
      )}
    </div>
  );
};

export default TaskDetail;
