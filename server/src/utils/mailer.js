import nodemailer from "nodemailer";

let transporter;
const configured = () => process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
const getTransporter = () => transporter ||= nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: String(process.env.SMTP_SECURE || "false") === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export const sendPasswordResetEmail = async ({ to, name, link, minutes }) => {
  const subject = "Reset your IEM Admission Portal password";
  const text = `Hello ${name},\n\nWe received a request to reset your IEM Admission Portal password.\nOpen the link below to choose a new password (valid for ${minutes} minutes):\n\n${link}\n\nIf you did not request this, you can safely ignore this email.\n\nInstitute of Engineering & Management`;
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e3e8ef;border-radius:12px;overflow:hidden">
    <div style="background:#102b52;color:#fff;padding:18px 24px;font-weight:700;letter-spacing:1px">IEM · ADMISSION PORTAL</div>
    <div style="padding:26px 24px;color:#17243a;line-height:1.6">
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click the button below to verify your email and choose a new password. This link is valid for <b>${minutes} minutes</b>.</p>
      <p style="text-align:center;margin:28px 0"><a href="${link}" style="background:#173d69;color:#fff;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:700">Reset password</a></p>
      <p style="font-size:12px;color:#64748b">Or paste this link into your browser:<br>${link}</p>
      <p style="font-size:12px;color:#64748b">If you did not request this, you can safely ignore this email — your password will not change.</p>
    </div></div>`;
  if (!configured()) {
    console.log("\n[DEV] SMTP not configured — password reset link for", to, "\n", link, "\n");
    return { sent: false };
  }
  await getTransporter().sendMail({ from: process.env.MAIL_FROM || process.env.SMTP_USER, to, subject, text, html });
  return { sent: true };
};
