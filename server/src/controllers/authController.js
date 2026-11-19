import bcrypt from "bcryptjs";
import User from "../models/User.js";
import crypto from "crypto";
import { makeToken } from "../utils/token.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail
} from "../utils/mailer.js";
const isStrongPassword = password =>
  typeof password === "string" &&
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9\s]/.test(password);

const passwordRequirementMessage =
  "Password must be at least 8 characters and contain letters, numbers, and at least one special character.";
const VERIFY_HOURS = 24;

const hashToken = t =>
  crypto.createHash("sha256").update(t).digest("hex");

const sendVerify = async (user, token) => {
  const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${token}`;

  try {
    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      link,
      hours: VERIFY_HOURS
    });
  } catch (e) {
    console.error("Verification email failed:", e.message);
  }
};


export const register = async (req, res, next) => {
  try {
    const { name, email, phone, address, password } = req.body;
    if (!name || !email || !phone || !address || !password) return res.status(400).json({ message: "All required fields must be completed." });
    if (!/^\S+@\S+\.\S+$/.test(email)) {
  return res.status(400).json({
    message: "Enter a valid email address."
  });
}
    if (!/^\d{10}$/.test(phone)) return res.status(400).json({ message: "Mobile number must contain exactly 10 digits." });
    if (!isStrongPassword(password)) {
  return res.status(400).json({
    message: passwordRequirementMessage
  });
}
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account with this email already exists." });
    const token = crypto.randomBytes(32).toString("hex");

const user = await User.create({
  name,
  email,
  phone,
  address,
  password: await bcrypt.hash(password, 12),
  isVerified: false,
  verifyToken: hashToken(token),
  verifyExpires: new Date(Date.now() + VERIFY_HOURS * 3600 * 1000)
});

await sendVerify(user, token);

res.status(201).json({
  message: `Account created. We've sent a verification link to ${user.email}. Please verify to sign in.`
});
  } catch (e) { next(e); }
};
export const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email: typeof email === "string" ? email.toLowerCase() : "" }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password." });
    if (user.isVerified === false) {
  return res.status(403).json({
    message: "Please verify your email before signing in. Check your inbox.",
    needsVerification: true
  });
}
    if (role === "admin" && user.role !== "admin") return res.status(403).json({ message: "This account does not have administrator access." });
    if (role === "student" && user.role === "admin") return res.status(403).json({ message: "This is an administrator account. Please use Admin Login." });
    res.json({ token: makeToken(user._id), user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
};
export const me = (req, res) => res.json({ user: { id: req.user._id, name: req.user.name, email: req.user.email, role: req.user.role } });

const RESET_MINUTES = 30;

export const forgotPassword = async (req, res, next) => {
  const generic = { message: "If an account exists for that email, a password reset link has been sent. Please check your inbox." };
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address." });
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = hashToken(token);
      user.resetPasswordExpires = new Date(Date.now() + RESET_MINUTES * 60 * 1000);
      await user.save({ validateBeforeSave: false });
      const link = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;
      try { await sendPasswordResetEmail({ to: user.email, name: user.name, link, minutes: RESET_MINUTES }); }
      catch (mailErr) { console.error("Reset email failed:", mailErr.message); }
    }
    res.json(generic);
  } catch (e) { next(e); }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || typeof token !== "string") return res.status(400).json({ message: "Invalid or expired reset link." });
    if (!isStrongPassword(password)) {
  return res.status(400).json({
    message: passwordRequirementMessage
  });
}
    const user = await User.findOne({ resetPasswordToken: hashToken(token), resetPasswordExpires: { $gt: new Date() } }).select("+resetPasswordToken +resetPasswordExpires");
    if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired. Please request a new one." });
    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password updated successfully. You can now sign in." });
  } catch (e) { next(e); }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        message: "Invalid or expired verification link."
      });
    }

    const user = await User.findOne({
      verifyToken: hashToken(token),
      verifyExpires: { $gt: new Date() }
    }).select("+verifyToken +verifyExpires");

    if (!user) {
      return res.status(400).json({
        message: "This verification link is invalid or has expired. Please request a new one."
      });
    }

    user.isVerified = true;

    // Keep the token until expiry so opening the link again does not fail.
    await user.save({ validateBeforeSave: false });

    res.json({
      message: "Email verified successfully. You can now sign in."
    });
  } catch (e) {
    next(e);
  }
};

export const resendVerification = async (req, res, next) => {
  const generic = {
    message: "If an unverified account exists for that email, a new verification link has been sent."
  };

  try {
    const email = typeof req.body.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";

    const user = await User.findOne({ email });

    if (user && !user.isVerified) {
      const token = crypto.randomBytes(32).toString("hex");

      user.verifyToken = hashToken(token);
      user.verifyExpires = new Date(
        Date.now() + VERIFY_HOURS * 3600 * 1000
      );

      await user.save({ validateBeforeSave: false });
      await sendVerify(user, token);
    }

    res.json(generic);
  } catch (e) {
    next(e);
  }
};