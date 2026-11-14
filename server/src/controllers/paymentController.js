import Application from "../models/Application.js";
import Payment from "../models/Payment.js";
export const pay = async (req, res, next) => {
  try {
    const { method, simulate = "success" } = req.body;
    if (!["UPI","Debit/Credit Card","Net Banking"].includes(method)) return res.status(400).json({ message: "Choose a valid payment method." });
    const app = await Application.findOne({ student: req.user._id });
    if (!app || app.status !== "Approved") return res.status(403).json({ message: "Payment is available only after application approval." });
    const existing = await Payment.findOne({ application: app._id, status: "Success" });
    if (existing) return res.status(409).json({ message: "Fee payment has already been completed.", payment: existing });
    if (simulate === "failure") {
      await Payment.create({ application: app._id, student: req.user._id, amount: 50000, method, status: "Failed", transactionId: `TEST-${Date.now()}` });
      return res.status(402).json({ message: "Payment Failed. Please try again." });
    }
    const payment = await Payment.create({
      application: app._id, student: req.user._id, amount: 50000, method, status: "Success",
      receiptNumber: `IEM-RCP-${Date.now()}`, transactionId: `TEST-${Math.random().toString(36).slice(2,10).toUpperCase()}`, paidAt: new Date()
    });
    res.status(201).json({ message: "Payment successful. Your receipt is ready.", payment });
  } catch (e) { next(e); }
};
export const getMyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ student: req.user._id, status: "Success" }).populate("application", "applicationId studentName");
    res.json({ payment });
  } catch (e) { next(e); }
};
