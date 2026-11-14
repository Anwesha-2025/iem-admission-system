import mongoose from "mongoose";
const documentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  originalName: String,
  filename: String,
  path: String,
  mimeType: String,
  size: Number
}, { _id: true });

const applicationSchema = new mongoose.Schema({
  applicationId: { type: String, unique: true, index: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  studentName: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
  address: { type: String, required: true },
  mobile: { type: String, required: true, match: /^\d{10}$/ },
  guardianName: { type: String, required: true },
  guardianRelation: { type: String, trim: true },
  guardianMobile: { type: String, match: /^\d{10}$/ },
  guardianEmail: { type: String, trim: true, lowercase: true },
  guardianOccupation: { type: String, trim: true },
  class10School: { type: String, required: true, trim: true },
  class10Board: { type: String, required: true, trim: true },
  class10Marks: { type: Number, min: 0, max: 100, required: true },
  class12School: { type: String, required: true, trim: true },
  class12Board: { type: String, required: true, trim: true },
  class12Marks: { type: Number, min: 0, max: 100, required: true },
  qualifyingExam: { type: String, required: true },
  qualifyingExamRank: { type: Number, min: 1 },
  qualifyingExamPercentile: { type: Number, min: 0, max: 100 },
  courseApplyingFor: { type: String, trim: true },
  documents: [documentSchema],
  status: { type: String, enum: ["Draft", "Submitted", "Under Review", "Approved", "Rejected"], default: "Draft" },
  rejectionReason: { type: String, default: "" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date
}, { timestamps: true });
applicationSchema.pre("save", async function(next) {
  if (!this.applicationId && this.status !== "Draft") {
    this.applicationId = `IEM${new Date().getFullYear()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  next();
});
export default mongoose.model("Application", applicationSchema);
