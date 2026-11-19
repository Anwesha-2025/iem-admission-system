
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  phone: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },

  address: {
    type: String,
    required: true,
    maxlength: 500
  },

  password: {
    type: String,
    required: true,
    select: false
  },

  resetPasswordToken: {
    type: String,
    select: false
  },

  resetPasswordExpires: {
    type: Date,
    select: false
  },

  isVerified: {
    type: Boolean,
    default: true
  },

  verifyToken: {
    type: String,
    select: false
  },

  verifyExpires: {
    type: Date,
    select: false
  },

  role: {
    type: String,
    enum: ["student", "admin"],
    default: "student"
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);
