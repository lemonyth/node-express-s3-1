const express = require("express");
const multer = require("multer");
// const { s3Uploadv2, s3Uploadv3 } = require("./s3Service");
const { s3Uploadv3 } = require("./s3Service");
const Image = require("./models/imageUploads");
const mongoose = require("mongoose");
require("dotenv").config();
const app = express();

// EJS AND VIEWS DIRECTORY CONFIG
app.set("view engine", "ejs");
app.use(express.static("resources"));

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

// const storage = multerS3({
//   s3: s3Uploadv3,
//   bucket: process.env.AWS_BUCKET_NAME,
//   metadata: (req, file, callback) => {
//     callback(null, { fieldName: file.fieldname });
//   },
//   key: (req, file, callback) => {
//     callback(null, `test-demo-1/${randomUUID()}-${file.originalname}`);
//   },
// });

// MONGOOSE CONFIG
// const dbUrl = "mongodb://localhost/node-express-s3-demo-1";
const dbUrl = process.env.MONGODB_URL;
mongoose
  .connect(dbUrl, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useCreateIndex: true,
  })
  .then(() => {
    console.log("MONGO CONNECTION OPEN");
    app.listen(4000, () => {
      console.log("listening on port 4000");
    });
  })
  .catch((err) => {
    console.log("SOMETHING WENT WRONG!", err);
  });

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
const upload = multer({ storage, fileFilter, limits: { fileSize: 100000000 } });

// app.post("/upload", upload.array("file"), async (req, res) => {
//   try {
//     // const file = req.files[0];
//     const results = await s3Uploadv2(req.files);
//     console.log(results);
//     return res.json({ status: "success!!!!", results });
//   } catch (error) {
//     console.log(error);
//   }
// });

//upload with version 3
app.post("/upload", upload.array("file"), async (req, res) => {
  try {
    // const file = req.files[0];
    const results = await s3Uploadv3(req.files);

    // saving each uploaded img's name url into mongo db
    results.forEach((result) => {
      const uploadedImages = new Image({
        imageName: result.Key,
        imageUrl: result.Location,
      });
      uploadedImages
        .save()
        .then((res) => {
          console.log("SUCCESSFULLY saved IMG in DB!!", res);
        })
        .catch((err) => {
          console.log("saving img in DB went wrong: ", err);
        });
    });

    return res.json({ status: "success!!!!" });
  } catch (error) {
    console.log(error);
  }
});

app.get("/", async (req, res) => {
  const images = await Image.find({});
  console.log(images);
  // const foundImage = {
  //   name: image.path
  // }
  res.render("home", { images });
  // res.render("home");
});
