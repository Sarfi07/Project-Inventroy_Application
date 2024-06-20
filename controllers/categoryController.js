const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");
const SubCategory = require("../models/subCategory");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  const [itemCount, categoryCount] = await Promise.all([
    Category.countDocuments({}).exec(),
    Item.countDocuments({}).exec(),
  ]);

  res.render("index", {
    title: "Inventory Application",
    item_count: itemCount,
    category_count: categoryCount,
  });
});

// all category
exports.category_list = asyncHandler(async (req, res, next) => {
  const allCategories = await Category.find().sort({ name: 1 }).exec();

  res.render("category_list", {
    title: "Category List",
    category_list: allCategories,
  });
});

// single category
exports.category_detail = asyncHandler(async (req, res, next) => {
  const [category, subCategories] = await Promise.all([
    Category.findById(req.params.id).exec(),
    SubCategory.find({ category: req.params.id }).exec(),
  ]);

  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category,
    subCategories: subCategories,
  });
});

exports.category_create_get = asyncHandler(async (req, res, next) => {
  console.log("category function");
  res.render("category_form", { title: "Create Category" });
});

// Handle category creation on POST
exports.category_create_post = [
  // Validate and sanitize fields
  body("name", "Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    console.log("fooo");
    // Extract validation errors from a request
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Save category
      try {
        await category.save();
        res.redirect(category.url);
      } catch (err) {
        // Check if the error is a CastError
        if (err.name === "CastError") {
          err.message = `Invalid data type for ${err.path}: ${err.value}`;
          err.status = 400; // Bad request
        }
        return next(err);
      }
    }
  }),
];

exports.category_update_get = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id).exec();

  console.log(category);

  res.render("category_form", {
    title: "Update Category",
    category: category,
  });
});

// Handle category creation on POST
exports.category_update_post = [
  // Validate and sanitize fields
  body("name", "Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization
  asyncHandler(async (req, res, next) => {
    // Extract validation errors from a request
    const errors = validationResult(req);

    // Create a category object with escaped and trimmed data
    const category = new Category({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages
      res.render("category_form", {
        title: "Create Category",
        category: category,
        errors: errors.array(),
      });
      return;
    } else {
      // Data from form is valid
      // Save category
      try {
        await Category.findByIdAndUpdate(req.params.id, category).exec();
        res.redirect(category.url);
      } catch (err) {
        // Check if the error is a CastError
        if (err.name === "CastError") {
          err.message = `Invalid data type for ${err.path}: ${err.value}`;
          err.status = 400; // Bad request
        }
        return next(err);
      }
    }
  }),
];

// delete
exports.category_delete_get = asyncHandler(async (req, res, next) => {
  const [subCategories, items, category] = await Promise.all([
    SubCategory.find({ category: req.params.id }).exec(),
    Item.find({ category: req.params.id }).exec(),
    Category.findById(req.params.id).exec(),
  ]);

  if (category === null) {
    res.redirect("/catelog/categories");
  }

  res.render("category_delete", {
    title: "Delete Category",
    category: category,
    subCategories: subCategories,
    items: items,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  const [subCategories, items, category] = await Promise.all([
    SubCategory.find({ category: req.params.id }).exec(),
    Item.find({ category: req.params.id }).exec(),
    Category.findById(req.params.id).exec(),
  ]);

  if (category === null) {
    res.redirect("/catelog/categories");
  }

  if (subCategories.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      subCategories: subCategories,
      items: items,
    });
    return;
  } else if (items.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      subCategories: subCategories,
      items: items,
    });
    return;
  } else {
    await Category.findByIdAndDelete(req.params.id).exec();
    res.redirect("/catalog/categories");
  }
});
