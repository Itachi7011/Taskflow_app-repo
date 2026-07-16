import { useContext, useState } from "react";
import Swal from "sweetalert2";
import { Send } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

const ReportIssue = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "bug",
    severity: "low",
    email: user?.email || "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // no dedicated backend endpoint for issue reports in this
      // assignment's scope, this just simulates the submission - swap
      // in a real POST /api/report-issue if you want this to persist
      await new Promise((r) => setTimeout(r, 600));
      Swal.fire({
        icon: "success",
        title: "Issue reported",
        text: "Thanks for letting us know, our team will take a look shortly.",
        confirmButtonColor: "#6d28d9",
      });
      setForm({ title: "", description: "", category: "bug", severity: "low", email: user?.email || "" });
      setFile(null);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Submission failed", confirmButtonColor: "#6d28d9" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="taskflow-reportissue">
      <div className="taskflow-reportissue-header">
        <h1>Report an Issue</h1>
        <p>Found a bug or something not working right? Let us know the details below.</p>
      </div>

      <form className="taskflow-reportissue-form" onSubmit={handleSubmit}>
        <div className="taskflow-reportissue-field">
          <label htmlFor="title">Issue title</label>
          <input id="title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div className="taskflow-reportissue-row">
          <div className="taskflow-reportissue-field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="bug">Bug</option>
              <option value="performance">Performance</option>
              <option value="ui">UI / UX</option>
              <option value="account">Account / Billing</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="taskflow-reportissue-field">
            <label htmlFor="severity">Severity</label>
            <select id="severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="taskflow-reportissue-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        </div>

        <div className="taskflow-reportissue-field">
          <label htmlFor="email">Your email</label>
          <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>

        <div className="taskflow-reportissue-field">
          <label htmlFor="file">Attach a screenshot (optional)</label>
          <input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} />
          <p className="taskflow-reportissue-file-note">{file ? file.name : "PNG or JPG, up to 5MB"}</p>
        </div>

        <button type="submit" className="taskflow-reportissue-submit" disabled={loading}>
          <Send size={16} /> {loading ? "Submitting..." : "Submit report"}
        </button>
      </form>
    </div>
  );
};

export default ReportIssue;
