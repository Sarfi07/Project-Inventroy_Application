const express = require("express");
const router = express.Router();
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

cloudinary.config({
  cloud_name: "dyzzyyud5",
  api_key: "627344314757969",
  api_secret: "UIdtBgnF1xgur5iPr9dnSpiyxvE",
});

const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");
const subCategory_controller = require("../controllers/subCategoryController");
const uploadController = require("../controllers/uploadController");

router.get("/", category_controller.index);

router.get("/categories", category_controller.category_list);

router.get("/category/create", category_controller.category_create_get);
router.post("/category/create", category_controller.category_create_post);

router.get("/category/:id", category_controller.category_detail);

router.get("/category/:id/update", category_controller.category_update_get);
router.post("/category/:id/update", category_controller.category_update_post);

router.get("/category/:id/delete", category_controller.category_delete_get);
router.post("/category/:id/delete", category_controller.category_delete_post);

router.get(
  "/sub_category/create",
  subCategory_controller.subCategory_create_get
);
router.post(
  "/sub_category/create",
  subCategory_controller.subCategory_create_post
);

router.get("/sub_category/:id", subCategory_controller.subCategory_detail);

router.get(
  "/sub_category/:id/update",
  subCategory_controller.subCategory_update_get
);
router.post(
  "/sub_category/:id/update",
  subCategory_controller.subCategory_update_post
);

router.get(
  "/sub_category/:id/delete",
  subCategory_controller.subCategory_delete_get
);

router.post(
  "/sub_category/:id/delete",
  subCategory_controller.subCategory_delete_post
);

router.get("/subcategories/:id", subCategory_controller.subCategory_list);

router.get("/item/create", item_controller.item_create_get);
router.post("/item/create", item_controller.item_create_post);

router.get("/item/:id", item_controller.item_detail);

router.get("/item/:id/update", item_controller.item_update_get);
router.post("/item/:id/update", item_controller.item_update_post);

router.get("/item/:id/delete", item_controller.item_delete_get);
router.post("/item/:id/delete", item_controller.item_delete_post);

router.get("/upload", uploadController.upload_get);
router.post("/upload", upload.single("file"), (req, res, next) => {
  console.log(req.file);
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
});

module.exports = router;
