const PrivacyPolicy = () => {
  return (
    <div className="taskflow-privacy">
      <h1>Privacy Policy</h1>
      <p className="taskflow-privacy-updated">Last updated: July 2026</p>

      <div className="taskflow-privacy-section">
        <h2>1. Data We Collect</h2>
        <p>When you use TaskFlow, we collect the following categories of information:</p>
        <ul>
          <li>Account information: name, email address, and a securely hashed password</li>
          <li>Task data: titles, input text, operation type, results and execution logs you submit</li>
          <li>Usage data: login timestamps, IP address (for rate limiting/security), and basic device info</li>
        </ul>
      </div>

      <div className="taskflow-privacy-section">
        <h2>2. How We Use Your Data</h2>
        <p>
          We use the information above to operate the core functionality of TaskFlow: authenticating
          you, running your submitted tasks, showing you their status and results, and keeping the
          platform secure. We do not sell your personal data to third parties.
        </p>
      </div>

      <div className="taskflow-privacy-section">
        <h2>3. Cookies and Tracking</h2>
        <p>
          TaskFlow uses minimal cookies/local storage, primarily to keep you logged in (storing
          your session token) and to remember your dark/light mode preference. We do not use
          third-party advertising trackers.
        </p>
      </div>

      <div className="taskflow-privacy-section">
        <h2>4. Data Sharing</h2>
        <p>
          Your data is processed internally by our own backend API, Redis queue, and Python worker
          fleet. We may share data with infrastructure providers strictly for the purpose of
          hosting the service (e.g. cloud hosting, container registries), and only to the extent
          necessary to operate TaskFlow.
        </p>
      </div>

      <div className="taskflow-privacy-section">
        <h2>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate information</li>
          <li>Request deletion of your account and associated task data</li>
          <li>Export a copy of your task history</li>
        </ul>
        <p>To exercise any of these rights, reach out via our Contact Us page or Report Issue page.</p>
      </div>

      <div className="taskflow-privacy-section">
        <h2>6. Security Measures</h2>
        <p>
          Passwords are hashed with bcrypt before storage and are never stored or logged in plain
          text. All authenticated requests require a signed JWT. Our API applies rate limiting and
          security headers (via Helmet) to reduce the risk of abuse, and sensitive configuration is
          stored using environment variables and Kubernetes Secrets rather than being hardcoded.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
