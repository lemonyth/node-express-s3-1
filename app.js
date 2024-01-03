const express = require("express");
const multer = require("multer");
const { s3Uploadv2 } = require("./s3Service");
require("dotenv").config();
const app = express();

// uploading w multer but without custome filenames
// const upload = multer({ dest: "uploads/" });

// app.post("/upload", upload.array("file", 2), (req, res) => {
//   console.log("UPLOADED FILES: ", req.files);
//   res.json({ status: "success" });
// });

// uploading w multer w custom filename
// const storage = multer.diskStorage({
//   destination: (req, file, callback) => {
//     callback(null, "uploads");
//   },
//   filename: (req, file, callback) => {
//     // console.log("from the middleware", file);
//     const { originalname } = file;

//     callback(null, `${randomUUID()}-${originalname}}`);
//   },
// });

const storage = multer.memoryStorage();

// how to filter files based on file types (images, pdfs, vids.. etc)

const fileFilter = (req, file, callback) => {
  if (file.mimetype.split("/")[0] === "image") {
    callback(null, true);
  } else {
    // callback ( null, false)
    callback(new Error("file is not of correct type!"));
  }
};
//more graceful error handling
app.use((error, req, res, next) => {
  //check for the type of error you wish to handle
  if (error instanceof multer.MulterError) {
    //check if error is due to filesize
    if (error.code === "LIMIT_FILE_SIZE")
      return res.json({ message: "file is too large!" });
  }

  // can add handling for other types of errors as well
});

// const upload = multer({ storage });
const upload = multer({ storage, fileFilter, limits: { fileSize: 400000 } });

app.post("/upload", upload.array("file"), async (req, res) => {
  // const command =  new PutObjectCommand({})
  const file = req.files[0];
  const result = await s3Uploadv2(file);
  console.log("custom filename upload: ", req.files);
  res.json({ status: "success!!!!", result });
});

app.get("/", (req, res) => {
  res.send("working");
});

app.listen(4000, () => {
  console.log("listening on port 4000");
});
