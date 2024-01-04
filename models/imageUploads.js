const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imageName: String,
  imageUrl: String,
});

const Image = mongoose.model("image", imageSchema);

module.exports = Image;
