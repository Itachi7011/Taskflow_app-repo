// utils/sendEmail.js
//
// in a real deployment you'd plug in SMTP creds (gmail, sendgrid, resend,
// whatever) via env vars. for this assignment / local dev, if those vars
// arent set we just console.log the link instead of actually sending
// anything - keeps the whole auth flow testable without a real inbox.
const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST) {
    console.log("----- EMAIL (SMTP not configured, printing instead) -----");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log(html);
    console.log("-----------------------------------------------------------");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"${process.env.APP_NAME}" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
