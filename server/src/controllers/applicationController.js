import Application from "../models/Application.js";
import Payment from "../models/Payment.js";

const requiredDocs = ["Photograph", "Class 10 Marksheet", "Class 12 Marksheet", "Aadhaar Card", "Transfer Certificate"];
export const getMyApplication = async (req, res, next) => {
  try {
    const application = await Application.findOne({ student: req.user._id });
    const payment = application ? await Payment.findOne({ application: application._id, status: "Success" }) : null;
    res.json({ application, payment, requiredDocs });
  } catch (e) { next(e); }
};
export const saveApplication = async (req, res, next) => {
  try {
    const fields = ["studentName","dob","gender","address","mobile","guardianName","guardianRelation","guardianMobile","guardianEmail","guardianOccupation","class10School","class10Board","class10Marks","class12School","class12Board","class12Marks","qualifyingExam","qualifyingExamRank","qualifyingExamPercentile","courseApplyingFor"];
    const optional = ["guardianEmail","guardianOccupation","qualifyingExamRank","qualifyingExamPercentile"];
    for (const f of fields.filter(f => !optional.includes(f))) if (req.body[f] === undefined || req.body[f] === "") return res.status(400).json({ message: `${f} is required.` });
    if (!/^\d{10}$/.test(req.body.mobile)) return res.status(400).json({ message: "Mobile number must contain exactly 10 digits." });
    if (!/^\d{10}$/.test(req.body.guardianMobile)) return res.status(400).json({ message: "Guardian mobile number must contain exactly 10 digits." });
    const entrance = ["IEM-JEE", "WB-JEE", "JEE-MAINS"];
    if (entrance.includes(req.body.qualifyingExam) && !String(req.body.qualifyingExamRank ?? "").trim())
      return res.status(400).json({ message: "Rank is mandatory for the selected entrance examination." });
    const pct = req.body.qualifyingExamPercentile;
    if (pct !== undefined && pct !== "" && (+pct < 0 || +pct > 100))
      return res.status(400).json({ message: "Percentile must be between 0 and 100." });
    if (req.body.guardianEmail && !/^\S+@\S+\.\S+$/.test(req.body.guardianEmail)) return res.status(400).json({ message: "Enter a valid guardian email address." });
    for (const f of ["class10Marks","class12Marks"]) if (+req.body[f] < 0 || +req.body[f] > 100) return res.status(400).json({ message: "Marks must be between 0 and 100." });
    let app = await Application.findOne({ student: req.user._id });
    if (app && ["Submitted","Under Review","Approved","Rejected"].includes(app.status)) return res.status(409).json({ message: "A submitted application cannot be edited. Contact the admissions office if a correction is needed." });
    const data = Object.fromEntries(fields.map(f => [f, req.body[f] ?? ""]));
    app = app ? Object.assign(app, data) : new Application({ ...data, student: req.user._id });
    await app.save();
    res.json({ message: "Application draft saved.", application: app });
  } catch (e) { next(e); }
};
export const uploadDocuments = async (req, res, next) => {
  try {
    const app = await Application.findOne({ student: req.user._id });
    if (!app || app.status !== "Draft") return res.status(400).json({ message: "Save an editable application draft before uploading documents." });
    const type = req.body.documentType;
    if (!requiredDocs.includes(type)) return res.status(400).json({ message: "Select a valid document type." });
    if (!req.file) return res.status(400).json({ message: "Please select a file." });
    app.documents = app.documents.filter(d => d.type !== type);
    app.documents.push({ type, originalName: req.file.originalname, filename: req.file.filename, path: `/uploads/${req.file.filename}`, mimeType: req.file.mimetype, size: req.file.size });
    await app.save();
    res.json({ message: `${type} uploaded successfully.`, documents: app.documents });
  } catch (e) { next(e); }
};
export const submitApplication = async (req, res, next) => {
  try {
    const app = await Application.findOne({ student: req.user._id });
    if (!app) return res.status(404).json({ message: "Complete and save the admission form first." });
    const missing = requiredDocs.filter(type => !app.documents.some(d => d.type === type));
    if (missing.length) return res.status(400).json({ message: `Upload all required documents: ${missing.join(", ")}.` });
    app.status = "Submitted";
    await app.save();
    res.json({ message: "Application submitted successfully.", application: app });
  } catch (e) { next(e); }
};
