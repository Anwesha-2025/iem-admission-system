import mongoose from "mongoose";
const paymentSchema = new mongoose.Schema({
  application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  receiptNumber: { type: String, unique: true, sparse: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ["UPI", "Debit/Credit Card", "Net Banking"], required: true },
  status: { type: String, enum: ["Success", "Failed"], required: true },
  transactionId: String,
  paidAt: Date
}, { timestamps: true });
export default mongoose.model("Payment", paymentSchema);
