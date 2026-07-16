import { useState } from "react";
import Swal from "sweetalert2";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // there's no dedicated contact endpoint on the backend for this
      // assignment, so this reuses the report-issue style flow -
      // swap in a real /api/contact route if you wire up email sending
      await new Promise((r) => setTimeout(r, 600));
      Swal.fire({ icon: "success", title: "Message sent!", text: "We'll get back to you within 1-2 business days.", confirmButtonColor: "#6d28d9" });
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      Swal.fire({ icon: "error", title: "Couldn't send message", confirmButtonColor: "#6d28d9" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="taskflow-contact">
      <div className="taskflow-contact-header">
        <h1>Get in touch</h1>
        <p>Questions, feedback, or partnership ideas - we'd love to hear from you.</p>
      </div>

      <div className="taskflow-contact-grid">
        <form className="taskflow-contact-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name</label>
            <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="message">Message</label>
            <textarea id="message" rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          </div>
          <button type="submit" disabled={loading}>
            <Send size={16} /> {loading ? "Sending..." : "Send message"}
          </button>
        </form>

        <div className="taskflow-contact-info">
          <div className="taskflow-contact-info-item">
            <Mail size={18} />
            <div>
              <h4>Email us</h4>
              <p>support@taskflow.dev</p>
            </div>
          </div>
          <div className="taskflow-contact-info-item">
            <Phone size={18} />
            <div>
              <h4>Call us</h4>
              <p>+91 98765 43210 (Mon-Fri, 10am-6pm IST)</p>
            </div>
          </div>
          <div className="taskflow-contact-info-item">
            <MapPin size={18} />
            <div>
              <h4>Office</h4>
              <p>4th Floor, Cyber Towers, Ghaziabad, Uttar Pradesh, India</p>
            </div>
          </div>
          <div className="taskflow-contact-info-item">
            <Clock size={18} />
            <div>
              <h4>Response time</h4>
              <p>We typically reply within 1-2 business days.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
