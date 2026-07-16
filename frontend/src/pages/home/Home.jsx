import { Link } from "react-router-dom";
import { Zap, Type, CaseLower, ArrowLeftRight, Hash, ArrowRight, Cpu, Clock, ShieldCheck } from "lucide-react";

const Home = () => {
  return (
    <div className="taskflow-home">
      <section className="taskflow-home-hero">
        <div className="taskflow-home-hero-badge">
          <Zap size={14} /> Asynchronous AI Task Processing
        </div>
        <h1>
          Queue it. Process it. <span>Watch it flow.</span>
        </h1>
        <p>
          TaskFlow lets you submit text processing jobs that run in the background on a
          dedicated worker fleet, so your app never has to sit and wait for a response.
        </p>
        <div className="taskflow-home-hero-actions">
          <Link to="/signup" className="taskflow-home-btn-primary">
            Get started free <ArrowRight size={18} />
          </Link>
          <Link to="/services" className="taskflow-home-btn-secondary">
            See how it works
          </Link>
        </div>
      </section>

      <section className="taskflow-home-features">
        <div className="taskflow-home-feature-card">
          <Type size={22} />
          <h3>Uppercase</h3>
          <p>Convert any block of text to uppercase in a single async task.</p>
        </div>
        <div className="taskflow-home-feature-card">
          <CaseLower size={22} />
          <h3>Lowercase</h3>
          <p>Normalize text down to lowercase, useful for cleaning up input data.</p>
        </div>
        <div className="taskflow-home-feature-card">
          <ArrowLeftRight size={22} />
          <h3>Reverse String</h3>
          <p>Flip your text back to front, handy for quick data transforms and demos.</p>
        </div>
        <div className="taskflow-home-feature-card">
          <Hash size={22} />
          <h3>Word Count</h3>
          <p>Instantly get a word count back for any chunk of text you submit.</p>
        </div>
      </section>

      <section className="taskflow-home-how">
        <h2>How a task flows through the system</h2>
        <div className="taskflow-home-how-steps">
          <div className="taskflow-home-how-step">
            <span>1</span>
            <p>You submit a task from your dashboard with a title, input text and operation type.</p>
          </div>
          <div className="taskflow-home-how-step">
            <span>2</span>
            <p>The API saves it as "pending" and pushes it onto a Redis queue instantly.</p>
          </div>
          <div className="taskflow-home-how-step">
            <span>3</span>
            <p>A Python worker picks it up, flips the status to "running", and processes it.</p>
          </div>
          <div className="taskflow-home-how-step">
            <span>4</span>
            <p>Results and logs are saved back, and the status becomes "success" or "failed".</p>
          </div>
        </div>
      </section>

      <section className="taskflow-home-trust">
        <div className="taskflow-home-trust-item">
          <Cpu size={20} />
          <span>Horizontally scalable workers</span>
        </div>
        <div className="taskflow-home-trust-item">
          <Clock size={20} />
          <span>Real-time status tracking</span>
        </div>
        <div className="taskflow-home-trust-item">
          <ShieldCheck size={20} />
          <span>JWT secured, rate limited API</span>
        </div>
      </section>
    </div>
  );
};

export default Home;
