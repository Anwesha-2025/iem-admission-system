import Application from "../models/Application.js";
import { sendApplicationStatusEmail } from "../utils/mailer.js";
export const listApplications = async (req, res, next) => {
  try {
    const { search = "", status = "All" } = req.query;
    const filter = {};
    if (status !== "All") filter.status = status;
    if (search) filter.$or = [{ applicationId: new RegExp(search, "i") }, { studentName: new RegExp(search, "i") }];
    const applications = await Application.find(filter).populate("student", "name email phone").sort({ createdAt: -1 });
    res.json({ applications });
  } catch (e) { next(e); }
};
export const getApplication = async (req, res, next) => {
  try {
    const app = await Application.findById(req.params.id).populate("student", "name email phone");
    if (!app) return res.status(404).json({ message: "Application not found." });
    res.json({ application: app });
  } catch (e) { next(e); }
};

export const reviewApplication = async (req, res, next) => {
  try {
    const { status, rejectionReason = "" } = req.body;

    if (!["Under Review", "Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status." });
    }

    if (status === "Rejected" && !rejectionReason.trim()) {
      return res.status(400).json({
        message: "A rejection reason is required."
      });
    }

    const app = await Application.findById(req.params.id);

    if (!app) {
      return res.status(404).json({
        message: "Application not found."
      });
    }

    app.status = status;
    app.rejectionReason = status === "Rejected" ? rejectionReason : "";
    app.reviewedBy = req.user._id;
    app.reviewedAt = new Date();

    await app.save();

    let emailSent = false;

    // Send notification only for final decisions
    if (status === "Approved" || status === "Rejected") {
      try {
        const updatedApp = await Application.findById(app._id)
          .populate("student", "name email");

        if (updatedApp?.student?.email) {
          const result = await sendApplicationStatusEmail({
            to: updatedApp.student.email,
            name: updatedApp.student.name || updatedApp.studentName || "Student",
            applicationId: updatedApp.applicationId,
            status,
            rejectionReason
          });

          emailSent = result.sent;
        } else {
          console.error("Student email not found for application:", app._id);
        }
      } catch (mailError) {
        console.error("Application status email failed:", mailError.message);
      }
    }

    const finalApp = await Application.findById(app._id)
      .populate("student", "name email phone");

    return res.json({
      message: `Application marked ${status}.`,
      emailSent,
      application: finalApp
    });

  } catch (e) {
    next(e);
  }
};

