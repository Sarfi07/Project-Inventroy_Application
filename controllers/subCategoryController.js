const SubCategory = require("../models/subCategory");
const asyncHandler = require("express-async-handler");
const Item = require("../models/item");
const Category = require("../models/category");
const { body, validationResult } = require("express-validator");

// all subCategory
exports.subCategory_list = asyncHandler(async (req, res, next) => {
  const subCategories = await SubCategory.find({
    category: req.params.id,
  }).exec();

  res.json({ subCategories: subCategories });
});

// display one subCategory
exports.subCategory_detail = asyncHandler(async (req, res, next) => {
  const [subCategory, items] = await Promise.all([
    SubCategory.findById(req.params.id).exec(),
    Item.find({ subCategory: req.params.id }).exec(),
  ]);

  const category = await Category.findById(subCategory.category).exec();

  res.render("subCategory_detail", {
    title: "Sub Category Detail",
    subCategory: subCategory,
    items: items,
    category: category,
  });
});

// create subCategory
exports.subCategory_create_get = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  res.render("subCategory_form", {
    title: "Create Sub Category",
    categories: allCategories,
  });
});

exports.subCategory_create_post = [
  body("name", "Sub Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const subCategory = new SubCategory({
      name: req.body.name,
      description: req.body.description,
      category: req.body.categoryId,
    });

    if (!errors.isEmpty()) {
      res.render("subCategory_form", {
        title: "Create Sub Category",
        subCategory: subCategory,
        errors: errors.array(),
      });
    } else {
      try {
        await subCategory.save();
        res.redirect(subCategory.url);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// update subCategory
exports.subCategory_update_get = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id).exec();
  const allCategories = await Category.find().sort({ name: 1 }).exec();
  const selectedCategory = await Category.findById(subCategory.category).exec();
  res.render("subCategory_form", {
    title: "Update Sub Category",
    categories: allCategories,
    selectedCategory: selectedCategory.name,
    subCategory: subCategory,
  });
});

exports.subCategory_update_post = [
  body("name", "Sub Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const subCategory = new SubCategory({
      name: req.body.name,
      description: req.body.description,
      category: req.body.categoryId,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render("subCategory_form", {
        title: "Create Sub Category",
        subCategory: subCategory,
        errors: errors.array(),
      });
    } else {
      try {
        await SubCategory.findByIdAndUpdate(req.params.id, subCategory);
        res.redirect(subCategory.url);
      } catch (err) {
        return next(err);
      }
    }
  }),
];

// delete subCategory
exports.subCategory_delete_get = asyncHandler(async (req, res, next) => {
  const [allItems, subCategory] = await Promise.all([
    Item.find({ subCategory: req.params.id }).exec(),
    SubCategory.findById(req.params.id).exec(),
  ]);

  res.render("subCategory_delete", {
    title: "Delete Sub Category",
    items: allItems,
    subCategory: subCategory,
  });
});

exports.subCategory_delete_post = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id).exec();

  const [category, subCategories] = await Promise.all([
    Category.findById(subCategory.category).exec(),
    SubCategory.find({ category: subCategory.category }).exec(),
  ]);

  if (subCategory === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  try {
    await SubCategory.findByIdAndDelete(req.params.id).exec();
    res.render("category_detail", {
      title: "Category Detail",
      category: category,
      subCategories: subCategories,
      confirmationMessage: `${subCategory.name} named sub category has been deleted.`,
    });
  } catch (err) {
    return next(err);
  }
});
