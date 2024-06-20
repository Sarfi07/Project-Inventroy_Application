const Item = require("../models/item");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dyzzyyud5",
  api_key: "627344314757969",
  api_secret: "UIdtBgnF1xgur5iPr9dnSpiyxvE",
});

// configure multer to store files
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// display single item
exports.item_detail = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id)
    .populate("category subCategory")
    .exec();

  res.render("item_detail", {
    item: item,
  });
});

// create
exports.item_create_get = asyncHandler(async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 }).exec();

  res.render("item_form", {
    title: "Create Item",
    categories: categories,
  });
});

exports.item_create_post = [
  upload.single("file"),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const file = req.file;
    console.log(req.file);
    if (!file) {
      res.status(400).send("No file Uploaded");
    }

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      async (error, result) => {
        if (error) {
          return next(error);
        }

        const categories = await Category.find().sort({ name: 1 }).exec();

        const imageUrl = result.secure_url;

        const item = new Item({
          name: req.body.name,
          description: req.body.description,
          category: req.body.categoryId,
          subCategory: req.body.subCategoryId,
          sizesAvailable: {
            size: req.body.size,
            quantity: req.body.quantity,
          },
          imageUrl: imageUrl,
        });

        if (!errors.isEmpty()) {
          res.render("item_form", {
            title: "Create Item",
            item: item,
            categories: categories,
            errors: errors.array(),
            selectedCategory: req.body.categoryId,
          });
        } else {
          try {
            await item.save();
            res.redirect(item.url);
          } catch (err) {
            return next(err);
          }
        }
      }
    );

    stream.end(file.buffer);
  }),
];

// update
exports.item_update_get = asyncHandler(async (req, res, next) => {
  const [categories, item] = await Promise.all([
    Category.find().sort({ name: 1 }).exec(),
    Item.findById(req.params.id).populate("category subCategory").exec(),
  ]);

  const subCategories = await SubCategory.find({
    category: item.category,
  }).exec();

  const selectedCategory = await Category.findById(item.category).exec();
  res.render("item_form", {
    title: "Update Item",
    item: item,
    categories: categories,
    selectedCategory: selectedCategory,
    subCategories: subCategories,
    selectedSubCategory: item.subCategory,
  });
});

exports.item_update_post = [
  body("name", "Sub Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const item = new Item({
      name: req.body.name,
      description: req.body.description,
      category: req.body.categoryId,
      subCategory: req.body.subcategoryId,
      sizesAvailable: {
        size: req.body.size,
        quantity: req.body.quantity,
      },
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("item_form", {
        title: "Create Item",
        item: item,
        errors: errors.array(),
      });
    } else {
      try {
        await Item.findByIdAndUpdate(req.params.id, item).exec();
        res.redirect(item.url);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// delete
exports.item_delete_get = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();
  res.render("item_delete", {
    title: "Delete Item",
    item: item,
  });
});
exports.item_delete_post = asyncHandler(async (req, res, next) => {
  const item = await Item.findById(req.params.id).exec();

  if (item === null) {
    const err = new Error("Item not found");
    err.status = 404;
    return next(err);
  }

  try {
    await Item.findByIdAndDelete(req.params.id).exec();
    res.redirect(`/catalog/sub_category/${item.subCategory}`);
  } catch (err) {
    return next(err);
  }
});
