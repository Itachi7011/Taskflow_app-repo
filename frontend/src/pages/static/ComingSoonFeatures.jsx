import { useState } from "react";
import Swal from "sweetalert2";
import { Mail } from "lucide-react";

const FEATURES = [
  { title: "Sentiment Analysis Operation", desc: "Detect positive, negative or neutral tone in submitted text.", status: "in-progress" },
  { title: "Text Summarization", desc: "Automatically condense long text input into a short summary.", status: "planned" },
  { title: "Webhook Notifications", desc: "Get notified via webhook the moment a task finishes, instead of polling.", status: "planned" },
  { title: "Batch Task Uploads", desc: "Submit a CSV of multiple inputs and run the same operation across all of them.", status: "planned" },
  { title: "Team Workspaces", desc: "Invite teammates into a shared workspace with shared task history.", status: "planned" },
  { title: "Real-time Status via WebSockets", desc: "Swap out polling for instant push updates on task status.", status: "in-progress" },
];

const ComingSoonFeatures = () => {
  const [email, setEmail] = useState("");

  const handleNotify = (e) => {
    e.preventDefault();
    Swal.fire({ icon: "success", title: "You're on the list!", text: "We'll email you when new features ship.", confirmButtonColor: "#6d28d9" });
    setEmail("");
  };

  return (
    <div className="taskflow-comingsoon">
      <div className="taskflow-comingsoon-header">
        <h1>What's coming to TaskFlow</h1>
        <p>A look at what we're building next</p>
      </div>

      <div className="taskflow-comingsoon-list">
        {FEATURES.map((f) => (
          <div className="taskflow-comingsoon-item" key={f.title}>
            <div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
            <span className={`taskflow-comingsoon-status ${f.status}`}>
              {f.status === "in-progress" ? "In Progress" : "Planned"}
            </span>
          </div>
        ))}
      </div>

      <div className="taskflow-comingsoon-notify">
        <h2>Want to be the first to know?</h2>
        <form className="taskflow-comingsoon-notify-form" onSubmit={handleNotify}>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit"><Mail size={16} style={{ marginRight: 6 }} />Notify me</button>
        </form>
      </div>
    </div>
  );
};

export default ComingSoonFeatures;
