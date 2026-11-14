import multer from "multer";
import path from "path";
import fs from "fs";
const uploadDir = path.resolve("uploads");
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const allowed = ["application/pdf", "image/jpeg", "image/png"];
const fileFilter = (_req, file, cb) => {
  if (!allowed.includes(file.mimetype)) return cb(Object.assign(new Error("Invalid File Type. Only PDF, JPG, JPEG and PNG are accepted."), { status: 400 }));
  cb(null, true);
};
export const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024, files: 10 } });
