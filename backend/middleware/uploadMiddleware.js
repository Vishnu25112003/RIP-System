const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Append timestamp to original file extension
    cb(null, Date.now() + path.extname(file.originalname).toLowerCase().trim());
  },
});

// File type filtering logic
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = [".jpg", ".jpeg", ".png", ".gif", ".avif"];
  const allowedTaskDocumentTypes = [".docx", ".txt"];
  const allowedExerciseFileTypes = [".pdf", ".doc", ".docx", ".txt", ".zip", ".jpg", ".jpeg", ".png"];

  const extname = path.extname(file.originalname).toLowerCase().trim();

  // Optional: Better debug log
  console.log(`Multer fileFilter: field='${file.fieldname}', name='${file.originalname}', ext='${extname}'`);

  switch (file.fieldname) {
    case "image":
      if (allowedImageTypes.includes(extname)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for image. Only ${allowedImageTypes.join(", ")} are allowed.`), false);
      }
      break;

    case "taskDocument":
      if (allowedTaskDocumentTypes.includes(extname)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for task document. Only ${allowedTaskDocumentTypes.join(", ")} are allowed.`), false);
      }
      break;

    case "exerciseFile":
      if (allowedExerciseFileTypes.includes(extname)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type for exercise file. Only ${allowedExerciseFileTypes.join(", ")} are allowed.`), false);
      }
      break;

    default:
      cb(new Error(`Unsupported file field: '${file.fieldname}'. Expected 'image', 'taskDocument', or 'exerciseFile'.`), false);
      break;
  }
};

// Configure multer with limits and storage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

module.exports = upload;
