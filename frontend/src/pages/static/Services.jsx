import { Link } from "react-router-dom";
import { Type, CaseLower, ArrowLeftRight, Hash, ArrowRight } from "lucide-react";

const ContactCta = () => (
  <section className="taskflow-services-cta">
    <h2>Ready to queue your first task?</h2>
    <Link to="/signup" className="taskflow-services-cta-btn">
      Try it free <ArrowRight size={18} />
    </Link>
  </section>
);

const Services = () => {
  return (
    <div className="taskflow-services">
      <div className="taskflow-services-header">
        <h1>What TaskFlow can do for you</h1>
        <p>Four focused text operations, all running asynchronously through the same reliable pipeline.</p>
      </div>

      <div className="taskflow-services-list">
        <div className="taskflow-services-item">
          <div className="taskflow-services-item-icon"><Type size={22} /></div>
          <div>
            <h3>Uppercase Conversion</h3>
            <p>Submit any block of text and get it back fully converted to uppercase. Useful for headers, banners, formatting normalization, or any pipeline step that needs consistent casing.</p>
            <ul>
              <li>Handles text up to 20,000 characters per task</li>
              <li>Preserves punctuation, numbers and whitespace exactly</li>
              <li>Ideal for: headline generation, style-guide enforcement</li>
            </ul>
          </div>
        </div>

        <div className="taskflow-services-item">
          <div className="taskflow-services-item-icon"><CaseLower size={22} /></div>
          <div>
            <h3>Lowercase Conversion</h3>
            <p>The mirror image of uppercase - flattens your text down to lowercase, which is a common first step in cleaning up user submitted data before further processing.</p>
            <ul>
              <li>Great for normalizing emails, usernames or tags</li>
              <li>Runs on the same worker fleet as every other operation</li>
              <li>Ideal for: data cleaning, search indexing prep</li>
            </ul>
          </div>
        </div>

        <div className="taskflow-services-item">
          <div className="taskflow-services-item-icon"><ArrowLeftRight size={22} /></div>
          <div>
            <h3>Reverse String</h3>
            <p>Flips your input text back to front. A simple transform, but a great way to see the full async pipeline in action end to end.</p>
            <ul>
              <li>Character-level reversal, not word-level</li>
              <li>Ideal for: demos, palindromic checks, quick experiments</li>
            </ul>
          </div>
        </div>

        <div className="taskflow-services-item">
          <div className="taskflow-services-item-icon"><Hash size={22} /></div>
          <div>
            <h3>Word Count</h3>
            <p>Returns the total number of words found in your input text, split on any whitespace, which is handy for content length checks and editorial workflows.</p>
            <ul>
              <li>Whitespace-aware splitting, handles multiple spaces/newlines</li>
              <li>Ideal for: content moderation, editorial length checks</li>
            </ul>
          </div>
        </div>
      </div>

      <ContactCta />
    </div>
  );
};

export default Services;
