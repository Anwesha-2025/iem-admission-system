import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
await mongoose.connect(process.env.MONGO_URI);
const email = (process.env.ADMIN_EMAIL || "admin@iem.edu").toLowerCase();
const password = process.env.ADMIN_PASSWORD || "Admin@12345";
const existing = await User.findOne({ email });
if (existing) {
  existing.role = "admin";
  existing.password = await bcrypt.hash(password, 12);
  await existing.save();
  console.log("Existing account promoted/reset as admin:", email);
} else {
  await User.create({ name: process.env.ADMIN_NAME || "IEM Administrator", email, phone: "9999999999", address: "IEM Campus", password: await bcrypt.hash(password, 12), role: "admin" });
  console.log("Admin created:", email);
}
await mongoose.disconnect();
