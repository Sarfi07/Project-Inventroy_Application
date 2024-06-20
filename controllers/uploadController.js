const cloudinary = require("cloudinary").v2;
const asyncHandler = require("express-async-handler");

cloudinary.config({
  cloud_name: "dyzzyyud5",
  api_key: "627344314757969",
  api_secret: "UIdtBgnF1xgur5iPr9dnSpiyxvE",
});

exports.upload_get = asyncHandler(async (req, res, next) => {
  res.render("upload_form", {
    title: "Upload Image to Cloudinary",
  });
});
exports.upload_post = (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).send("No file uploaded");
  }

  const stream = cloudinary.uploader.upload_stream(
    { resource_type: "image" },
    async (error, result) => {
      if (error) {
        return next(error);
      }

      try {
        const imageUrl = result.secure_url;

        res.send(imageUrl);
      } catch (err) {
        next(err);
      }
    }
  );

  stream.end(file.buffer);
};
