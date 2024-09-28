// require('dotenv').config()
// const express = require("express");
// const multer = require("multer");
// const cors = require("cors");
// const docxToPDF = require("docx-pdf");
// const path = require("path");
// const app = express();
// const port = process.env.PORT || 3000;

// app.use(cors());
// // settting up the file storage
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, "uploads");
//     },
//     filename: function(req, file, cb) {
//         cb(null, file.originalname);
//     },
// });
// const upload = multer({ storage: storage });
// app.post("/convertFile", upload.single("file"), (req, res, next) => {
//     try {
//         if (!req.file) {
//             return res.status(400).json({
//                 message: "No file  uploaded",
//             });
//         }
//         // Defining outout file path
//         let outoutPath = path.join(
//             __dirname,
//             "files",
//             `${req.file.originalname}.pdf`
//         );
//         docxToPDF(req.file.path, outoutPath, (err, result) => {
//             if (err) {
//                 console.log(err);
//                 return res.status(500).json({
//                     message: "Error converting docx to pdf",
//                 });
//             }
//             res.download(outoutPath, () => {
//                 console.log("file downloaded");
//             });
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Internal server error",
//         });
//     }
// });
// app.listen(port, () => {
//     console.log(`Server is listening on port ${port}`);
// });

require('dotenv').config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const docxToPDF = require("docx-pdf");
const path = require("path");
const fs = require('fs');
const util = require('util'); // For TextDecoder polyfill
const app = express();
const port = process.env.PORT || 3000;

// Polyfill TextDecoder and TextEncoder if not available
if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = util.TextDecoder;
}

if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = util.TextEncoder;
}

// Configure CORS
app.use(cors());

// Add a simple GET route for testing
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// Ensure 'uploads' and 'files' directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const filesDir = path.join(__dirname, 'files');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

if (!fs.existsSync(filesDir)) {
    fs.mkdirSync(filesDir);
}

// Setting up the file storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "uploads");
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    },
});
const upload = multer({ storage: storage });

app.post("/convertFile", upload.single("file"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No file uploaded",
            });
        }
        // Defining output file path
        let outputPath = path.join(
            __dirname,
            "files",
            `${req.file.originalname}.pdf`
        );
        docxToPDF(req.file.path, outputPath, (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Error converting docx to pdf",
                });
            }
            res.download(outputPath, () => {
                console.log("file downloaded");
                // Optionally, delete the files after download
                fs.unlink(req.file.path, (err) => {
                    if (err) console.error(err);
                });
                fs.unlink(outputPath, (err) => {
                    if (err) console.error(err);
                });
            });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
