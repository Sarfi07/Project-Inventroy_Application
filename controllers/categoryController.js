const { body, validationResult } = require("express-validator");
const Category = require("../models/category");
const Item = require("../models/item");
const SubCategory = require("../models/subCategory");
const asyncHandler = require("express-async-handler");
const pool = require("../db/pool");

exports.index = asyncHandler(async (req, res, next) => {
  try {
    let [itemCount, categoryCount] = await Promise.all([
      pool.query("SELECT count(*) from category;"),
      pool.query("SELECT count(*) from item;"),
    ]);

    itemCount = parseInt(itemCount.rows[0].count, 10);
    categoryCount = parseInt(categoryCount.rows[0].count, 10);
    console.log(itemCount);

    res.render("index", {
      title: "Inventory Application",
      item_count: itemCount,
      category_count: categoryCount,
    });
  } catch (err) {
    next(err);
  }
});

// all category
exports.category_list = asyncHandler(async (req, res, next) => {
  // const allCategories = await Category.find().sort({ name: 1 }).exec();

  const allCategories = await pool.query(
    "SELECT * from category ORDER BY name ASC "
  );

  res.render("category_list", {
    title: "Category List",
    category_list: allCategories.rows,
  });
});

// single category
exports.category_detail = asyncHandler(async (req, res, next) => {
  // const [category, subCategories] = await Promise.all([
  //   Category.findById(req.params.id).exec(),
  //   SubCategory.find({ category: req.params.id }).exec(),
  // ]);

  const [category, subCategories] = await Promise.all([
    pool.query(`SELECT * from category where id=${req.params.id}`),
    pool.query(`SELECT * from subCategory where category_id=${req.params.id}`),
  ]);
  if (category === null) {
    const err = new Error("Category not found");
    err.status = 404;
    return next(err);
  }

  res.render("category_detail", {
    title: "Category Detail",
    category: category.rows[0],
    subCategories: subCategories.rows,
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
    // const category = new Category({
    //   name: req.body.name,
    //   description: req.body.description,
    // });

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
        // await category.save();
        const newCategory = await pool.query(
          "INSERT INTO category (name, description) VALUES($1, $2) RETURNING id",
          [req.body.name, req.body.description]
        );
        res.redirect("/catalog/category/" + newCategory.rows[0].id);
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
  // const category = await Category.findById(req.params.id).exec();
  const category = await pool.query("SELECT * from category where id = ($1)", [
    req.params.id,
  ]);

  console.log(category.rows[0]);

  res.render("category_form", {
    title: "Update Category",
    category: category.rows[0],
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
    // const category = new Category({
    //   name: req.body.name,
    //   description: req.body.description,
    //   _id: req.params.id,
    // });

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
        // await Category.findByIdAndUpdate(req.params.id, category).exec();
        await pool.query(
          "UPDATE category SET name=($1), description=($2) where id=($3)",
          [req.body.name, req.body.description, req.params.id]
        );
        res.redirect("/catalog/category/" + req.params.id);
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
  // const [subCategories, items, category] = await Promise.all([
  //   SubCategory.find({ category: req.params.id }).exec(),
  //   Item.find({ category: req.params.id }).exec(),
  //   Category.findById(req.params.id).exec(),
  // ]);

  const [subCategories, items, category] = await Promise.all([
    pool.query(`SELECT * FROM subCategory WHERE category_id=${req.params.id}`),
    pool.query(`SELECT * FROM item where category_id=${req.params.id}`),
    pool.query(`SELECT * FROM category WHERE id=${req.params.id}`),
  ]);

  if (category === null) {
    res.redirect("/catelog/categories");
  }

  console.log(items.rows);

  res.render("category_delete", {
    title: "Delete Category",
    category: category.rows[0],
    subCategories: subCategories.rows,
    items: items.rows,
  });
});

exports.category_delete_post = asyncHandler(async (req, res, next) => {
  // const [subCategories, items, category] = await Promise.all([
  //   SubCategory.find({ category: req.params.id }).exec(),
  //   Item.find({ category: req.params.id }).exec(),
  //   Category.findById(req.params.id).exec(),
  // ]);

  const [subCategories, items, category] = await Promise.all([
    pool.query(`SELECT * FROM subCategory WHERE category_id=${req.params.id}`),
    pool.query(`SELECT * FROM item where category_id=${req.params.id}`),
    pool.query(`SELECT * FROM category WHERE id=${req.params.id}`),
  ]);

  if (category.rows[0] === null) {
    res.redirect("/catelog/categories");
  }

  if (subCategories.rows.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      subCategories: subCategories,
      items: items,
    });
    return;
  } else if (items.rows.length > 0) {
    res.render("category_delete", {
      title: "Delete Category",
      category: category,
      subCategories: subCategories,
      items: items,
    });
    return;
  } else {
    // await Category.findByIdAndDelete(req.params.id).exec();
    await pool.query(`DELETE FROM category where id=${req.params.id}`);
    res.redirect("/catalog/categories");
  }
});
