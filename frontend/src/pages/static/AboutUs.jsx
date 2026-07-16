import { Link } from "react-router-dom";
import { Target, Eye, Heart, Users, ArrowRight, Cpu, ShieldCheck, Rocket } from "lucide-react";

const AboutUs = () => {
  return (
    <div className="taskflow-about">
      <section className="taskflow-about-hero">
        <h1>Built for the way modern teams process text at scale</h1>
        <p>
          TaskFlow started as a simple idea: most text processing work doesn't need to block your
          application while it happens. It should be queued, processed reliably in the background,
          and delivered back to you the moment it's ready - no polling nightmares, no timeouts, no
          babysitting a spinner.
        </p>
      </section>

      <section className="taskflow-about-story">
        <h2>Our story</h2>
        <p>
          We built TaskFlow after running into the same problem over and over on different
          projects: a request comes in, it needs some processing done to text (cleaning it up,
          transforming it, analyzing it), and the easiest thing to do is just process it inline and
          make the user wait. That works fine until volume grows, and suddenly your API is timing
          out or your servers are pegged doing work that has nothing to do with serving requests.
        </p>
        <p>
          So we split things apart. An API that's only job is to accept work and hand back a task
          id. A queue that holds that work safely even if things get busy. And a fleet of workers,
          written in Python, dedicated entirely to chewing through that queue as fast as they can -
          and that you can scale up or down independently of everything else.
        </p>
      </section>

      <section className="taskflow-about-values">
        <h2>What we care about</h2>
        <div className="taskflow-about-values-grid">
          <div className="taskflow-about-value-card">
            <Target size={22} />
            <h3>Our Mission</h3>
            <p>Make asynchronous background processing something any team can set up in an afternoon, not a quarter.</p>
          </div>
          <div className="taskflow-about-value-card">
            <Eye size={22} />
            <h3>Our Vision</h3>
            <p>A world where developers never have to think twice about whether a task belongs on the request thread or in the background.</p>
          </div>
          <div className="taskflow-about-value-card">
            <Heart size={22} />
            <h3>Reliability first</h3>
            <p>A task that says "success" actually succeeded. A task that says "failed" tells you exactly why.</p>
          </div>
          <div className="taskflow-about-value-card">
            <ShieldCheck size={22} />
            <h3>Security by default</h3>
            <p>Hashed passwords, signed tokens, and rate limiting are not optional add-ons here, they ship on day one.</p>
          </div>
          <div className="taskflow-about-value-card">
            <Cpu size={22} />
            <h3>Built to scale</h3>
            <p>Workers are stateless and horizontally scalable, so throughput is a scaling decision, not an architecture rewrite.</p>
          </div>
          <div className="taskflow-about-value-card">
            <Rocket size={22} />
            <h3>Ship fast, ship safe</h3>
            <p>Every change goes through automated linting, builds, and image pushes before it ever reaches production.</p>
          </div>
        </div>
      </section>

      <section className="taskflow-about-team">
        <Users size={26} />
        <h2>The team behind TaskFlow</h2>
        <p>
          TaskFlow is maintained by a small, focused team of backend, frontend, and DevOps
          engineers who all believe that good infrastructure should feel invisible - it should
          just work, quietly, in the background, exactly like the tasks it processes.
        </p>
      </section>

      <section className="taskflow-about-cta">
        <h2>Ready to see it in action?</h2>
        <Link to="/signup" className="taskflow-about-cta-btn">
          Create your free account <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
};

export default AboutUs;
