import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const FAQ_DATA = [
  {
    category: "Getting Started",
    items: [
      { q: "What is TaskFlow?", a: "TaskFlow is a platform for creating and running text processing tasks asynchronously - you submit a task, it's queued, a background worker processes it, and you can watch its status change in real time." },
      { q: "Do I need to install anything?", a: "No, TaskFlow runs entirely in your browser through our web dashboard. There's nothing to install to get started." },
      { q: "Is there a free plan?", a: "Yes, signing up gives you full access to create and run tasks right away." },
    ],
  },
  {
    category: "Tasks & Processing",
    items: [
      { q: "What operations are supported?", a: "Currently: Uppercase, Lowercase, Reverse String, and Word Count. More operations may be added over time - check our Coming Soon page." },
      { q: "How long does a task take to process?", a: "Most tasks complete in well under a second once picked up by a worker. Under heavy load, tasks may briefly sit in the 'pending' queue before a worker becomes available." },
      { q: "What happens if a task fails?", a: "The task status changes to 'failed' and you'll see an error message plus the execution logs on the task detail page. You can rerun it directly from there." },
    ],
  },
  {
    category: "Account & Security",
    items: [
      { q: "How is my password stored?", a: "Your password is hashed using bcrypt before it's ever saved - we never store or see your plain text password." },
      { q: "How do I reset my password?", a: "Use the 'Forgot password?' link on the login page to receive a secure, time-limited reset link by email." },
      { q: "Can I delete my account?", a: "Yes, reach out through the Contact Us or Report Issue page and we'll process your deletion request." },
    ],
  },
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState("0-0");

  const toggle = (key) => setOpenIndex((prev) => (prev === key ? null : key));

  return (
    <div className="taskflow-faqs">
      <div className="taskflow-faqs-header">
        <h1>Frequently Asked Questions</h1>
        <p>Everything you need to know about running tasks on TaskFlow</p>
      </div>

      {FAQ_DATA.map((group, gi) => (
        <div className="taskflow-faqs-category" key={group.category}>
          <h2>{group.category}</h2>
          {group.items.map((item, ii) => {
            const key = `${gi}-${ii}`;
            const isOpen = openIndex === key;
            return (
              <div className="taskflow-faqs-item" key={key}>
                <button className="taskflow-faqs-question" onClick={() => toggle(key)} aria-expanded={isOpen}>
                  {item.q}
                  <ChevronDown size={16} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s ease" }} />
                </button>
                {isOpen && <div className="taskflow-faqs-answer">{item.a}</div>}
              </div>
            );
          })}
        </div>
      ))}

      <p className="taskflow-faqs-contact-note">
        Still have questions? <Link to="/contact">Contact our support team</Link>
      </p>
    </div>
  );
};

export default FAQs;
